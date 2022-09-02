import { FaTrashAlt } from 'react-icons/fa'

import styles from './index.module.css'

export function Task({ id, subject, isCompleted, onRemove, onChangeCompleted }) {
  return (
    <li className={`${styles.task} ${isCompleted ? styles.completed : ''}`}>
      <input
        type="checkbox"
        checked={isCompleted}
        className={styles.task__checkbox}
        onChange={e => onChangeCompleted(id)}
      />

      <span className={styles.task__name}>
        {subject}
      </span>

      <button
        type="button"
        className={styles.task__button}
        onClick={() => onRemove(id)}
      >
        <FaTrashAlt size={16} />
      </button>
    </li>
  )
}