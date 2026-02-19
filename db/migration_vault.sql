-- Add winner_id to drops table
alter table drops
add column winner_id uuid references profiles(id);

-- Optional: Add policy so public can see who won?
-- Already covered by "drops are viewable by everyone" policy.

-- Create a function to pick a winner (randomly) - useful for Admin later
create or replace function pick_winner(drop_id_param bigint)
returns uuid as $$
declare
  winning_user_id uuid;
begin
  select user_id into winning_user_id
  from entries
  where drop_id = drop_id_param
  order by random()
  limit 1;

  update drops
  set winner_id = winning_user_id,
      status = 'completed'
  where id = drop_id_param;

  return winning_user_id;
end;
$$ language plpgsql security definer;
