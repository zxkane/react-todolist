import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { FaPlus } from 'react-icons/fa'
import { Input } from '../Input'
import styles from './index.module.css'

export function Form({ onSubmit }) {
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    
    if(!!taskName && !!taskDescription) {
      const newTask = {
        subject: taskName,
        description: taskDescription,
        isCompleted: false,
      }

      onSubmit(newTask)
      setTaskName('')
      setTaskDescription('')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.form__div}>
        
      <Input
        style={{width: "100%"}}
        type="text"
        value={taskName}
        placeholder="task subject"
        onChange={event => setTaskName(event.target.value)}
      />
      <div>
      <textarea
        type="textarea"
        className={styles.form__textarea}
        value={taskDescription}
        placeholder="task description"
        onChange={event => setTaskDescription(event.target.value)}
      />
      </div>
      </div>
      <div>
      <button
        type="submit"
        disabled={taskName === '' || taskDescription === ''}
        className={styles.form__button}
      >
        <FaPlus size={12} />
        Add
      </button>
      </div>
    </form>
  )
}