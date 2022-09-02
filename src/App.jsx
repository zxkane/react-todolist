import { useEffect, useMemo, useState } from "react"

import { Form } from './components/Form'
import { Input } from "./components/Input"
import { Tasks } from './components/Tasks'

import styles from './styles/app.module.css'

import Axios from "axios";
import HTTP from "./common/http";
import './common/types'

export function App() {
  const [tasks, setTasks] = useState([])
  const [searchTaskName, setSearchTaskName] = useState('')
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingChange, setLoadingChange] = useState(false);
  const [subjectEmptyError, setSubjectEmptyError] = useState(false);

  const onAddTask = async(newTask) => {
    if (!newTask.subject.trim()) {
      setSubjectEmptyError(true);
      return;
    }
    try {
      setLoadingCreate(true);
      const res = await HTTP({
        method: "PUT",
        data: {
          subject: newTask.subject,
          description: newTask.description,
        },
        url: "/todo",
      });
      if (res.data) {
        setSubjectEmptyError(false);
        setLoadingCreate(false);
        getTasks();
      }
    } catch (error) {
      setLoadingCreate(false);
      console.info(error);
    }

    setSearchTaskName('')
  }

  const onRemoveTask = async (taskId) => {
    try {
      setLoadingChange(true);
      const res = await HTTP({
        method: "DELETE",
        data: {
        },
        url: "/todo/" + taskId.substring(5),
      });
      if(res.data) {
        getTasks();
      }
    } catch (error) {
      console.info(error);
    } finally {
      setLoadingChange(false);
    }
  }

  const onChangeCompleted = async(taskId) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId)

    const updatedTask = [...tasks]
    const taskToBeChanged = updatedTask[taskIndex];
    
    try {
      setLoadingChange(true);
      const res = await HTTP({
        method: "POST",
        data: {
          subject: taskToBeChanged.subject,
          description: taskToBeChanged.description,
          isCompleted: !taskToBeChanged.isCompleted,
        },
        url: "/todo/" + taskId.substring(5),
      });
      if(res.data) {
        getTasks();
      }
    } catch (error) {
      console.info(error);
    } finally {
      setLoadingChange(false);
    }
  }

  const getTasks = async () => {
    try {
      setLoadingData(true);
      const res = await HTTP({
        method: "GET",
        data: {
          "content-type": "application/json",
        },
        url: "/todo",
      });
      setLoadingData(false);
      const tasksData = res.data;
      if ((typeof tasksData === "string")) {
        Swal.fire("Ops..", tasksData);
      } else {
        setTasks(tasksData);
      }
    } catch (error) {
      console.info(error);
    }
  };


  const handleTermSearch = (e) => {
    const valueTerm = e.target.value.toLocaleLowerCase()
    setSearchTaskName(valueTerm)
  }

  const totalTasks = useMemo(() => {
    return tasks.length
  }, [tasks])

  const totalCompletedTasks = useMemo(() => {
    return tasks.filter(task => task.isCompleted).length
  })

  // Esse bloco de código é disparado toda a vez que o array de
  // tasks sofrer alguma alteração(add, remove, update)
  useEffect(() => {
    setLoadingConfig(true);
    // Axios.get("/aws-exports.json").then((res) => {
    //   setLoadingConfig(false);
    // });
    getTasks();
    setLoadingConfig(false);
  }, []);

  if (loadingConfig) {
    return (
      <div className="pd-20 text-center">
        Loading...
      </div>
    );
  }  

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>TODOLIST</h1>

        <Form onSubmit={onAddTask} />

        <hr />

        <Input
          type="text"
          value={searchTaskName}
          onChange={handleTermSearch}
          placeholder="search for a task"
        />

        <Tasks
          tasks={tasks}
          searchTaskName={searchTaskName}
          onRemoveTask={onRemoveTask}
          onChangeCompletedTask={onChangeCompleted}
        />

        <footer className={styles.footer}>
          <h6>
            Total tasks:
            <span>{totalTasks}</span>
          </h6>

          <h6>
            Total completed tasks:
            <span>{totalCompletedTasks}</span>
          </h6>
        </footer>
      </div>

    </div>
  )
}