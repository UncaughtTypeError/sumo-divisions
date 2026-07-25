import Tooltip from './Tooltip';
import styles from './KinboshiBadge.module.css';

export const KINBOSHI_TYPES = {
  WON:   'won',
  GIVEN: 'given',
};

function KinboshiBadge({ type, count }) {
  const isGiven = type === KINBOSHI_TYPES.GIVEN;
  return (
    <Tooltip
      content={
        <>
          <strong>{isGiven ? 'Kinboshi Given' : 'Kinboshi'}</strong>
          <span>金星</span>
          <span>
            {isGiven
              ? 'Gold star given to Maegashira opponent'
              : 'Gold star for defeating a Yokozuna'}
          </span>
        </>
      }
    >
      <span className={`${styles.badge} ${isGiven ? styles.given : styles.won}`}>
        ★{count}
      </span>
    </Tooltip>
  );
}

export default KinboshiBadge;
