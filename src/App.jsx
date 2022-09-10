import { useEffect, useMemo, useState } from "react"

import { Form } from './components/Form'
import { Input } from "./components/Input"
import { Tasks } from './components/Tasks'

import styles from './styles/app.module.css'

import Axios from "axios";
import HTTP from "./common/http";
import './common/types';

import { Amplify, Auth, API, Hub } from "aws-amplify";
import {
  Authenticator,
  useAuthenticator,
  Flex,
  View,
  useTheme,
  Text,
  Button,
  Divider,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Swal from "sweetalert2";

export function App() {
  const [tasks, setTasks] = useState([])
  const [searchTaskName, setSearchTaskName] = useState('')
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingChange, setLoadingChange] = useState(false);
  const [subjectEmptyError, setSubjectEmptyError] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('');
  var apiEndpointName;
  const [isAuthenticated, setIAuthenticated] = useState(false);
  const [oidcProviderName, setOidcProviderName] = useState('');

  const onAddTask = async(newTask) => {
    if (!newTask.subject.trim()) {
      setSubjectEmptyError(true);
      return;
    }
    try {
      setLoadingCreate(true);
      
      const initData = {
        body: {
          subject: newTask.subject,
          description: newTask.description,
        },
        headers: { "content-type": "application/json" },
        response: true,
      };
      API.put(apiEndpoint, "/todo/", initData).then((res) => {
        if (res.data) {
          setSubjectEmptyError(false);
          setLoadingCreate(false);
          getTasks();
        }
      }).catch((error) => {
        console.info(error);
        Swal.fire(
          `${error.message}`,
          `${error?.response?.data?.message}`,
          undefined
        );
      });
    } catch (error) {
      setLoadingCreate(false);
      console.info(error);
    }

    setSearchTaskName('')
  }

  const onRemoveTask = async (taskId) => {
    try {
      setLoadingChange(true);
     
      const initData = {
        headers: { "content-type": "application/json" },
        response: true,
      };     
      API.del(apiEndpoint, "/todo/" + taskId.substring(5), initData).then((res) => {
        if(res.data) {
          getTasks();
        }
      }).catch((error) => {
        console.info(error);
        Swal.fire(
          `${error.message}`,
          `${error?.response?.data?.message}`,
          undefined
        );
      });
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
      
      const initData = {
        body: {
          subject: taskToBeChanged.subject,
          description: taskToBeChanged.description,
          isCompleted: !taskToBeChanged.isCompleted,
        },
        headers: { "content-type": "application/json" },
        response: true,
      };
      API.post(apiEndpoint, "/todo/" + taskId.substring(5), initData).then((res) => {
        if(res.data) {
          getTasks();
        }
      }).catch((error) => {
        console.info(error);
        Swal.fire(
          `${error.message}`,
          `${error?.response?.data?.message}`,
          undefined
        );
      });
    } catch (error) {
      console.info(error);
    } finally {
      setLoadingChange(false);
    }
  }

  const getTasks = async () => {
    const canEnter = await ionViewCanEnter();
    if (canEnter) {
      try {
        setLoadingData(true);
        
        const initData = {
          headers: { "content-type": "application/json" }, // OPTIONAL
          response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        };        
        API
        .get(apiEndpointName || apiEndpoint, "/todo", initData)
        .then(res => {
          setLoadingData(false);
          const tasksData = res.data;
          if ((typeof tasksData === "string")) {
            Swal.fire("Ops..", tasksData);
          } else {
            setTasks(tasksData);
          }
        })
        .catch(error => {
          setLoadingData(false);
          console.error(error);
          Swal.fire(
            `${error.message}`,
            `${error?.response?.data?.message}`,
            undefined
          );
        });
      } catch (error) {
        console.info(error);
      }
    }
  };

  const ionViewCanEnter = async () => {
    try {
        await Auth.currentAuthenticatedUser();
        return true;
    } catch {
        return false;
    }
  }

  const handleTermSearch = (e) => {
    const valueTerm = e.target.value.toLocaleLowerCase();
    setSearchTaskName(valueTerm);
  }

  const totalTasks = useMemo(() => {
    return tasks.length
  }, [tasks]);

  const totalCompletedTasks = useMemo(() => {
    return tasks.filter(task => task.isCompleted).length
  })

  // Esse bloco de código é disparado toda a vez que o array de
  // tasks sofrer alguma alteração(add, remove, update)
  useEffect(() => {
    setLoadingConfig(true);
    Axios.get("/aws-exports.json").then((res) => {
      const configData = res.data;
      const tokenHeader = async () => { return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }; };
      configData.API.endpoints[0].custom_header = tokenHeader;
      Amplify.configure(configData);
      apiEndpointName = configData.API.endpoints[0].name;
      setApiEndpoint(configData.API.endpoints[0].name);
      setOidcProviderName(configData.Auth.oauth?.name);
      
      getTasks();
      
      setLoadingConfig(false);
    });
  }, []);

  Hub.listen('auth', ({ payload }) => {
    const { event } = payload;
    switch (event) {
      case 'signIn':
      case 'signUp':
      case 'autoSignIn':
        setIAuthenticated(true);
        getTasks();
        break;
      case "signOut":
      case "signIn_failure":
      case "oAuthSignOut":
        setIAuthenticated(false);
        break;
    }
  });  

  if (loadingConfig) {
    return (
      <div className="pd-20 text-center">
        Loading...
      </div>
    );
  }  

  const components = {
    Header() {
      const { tokens } = useTheme();
  
      return (
        <View textAlign="center" padding={tokens.space.large}>
          <Text
            variation="success"
            as="strong"
            color="gray"
            lineHeight="1.5em"
            fontWeight={1600}
            fontSize="3em"
            fontStyle="normal"
            textDecoration="none"
            width="30vw"
          >
            Todolist
        </Text>
        </View>
      );
    },
    SignIn: {
      Footer() {
        const { toResetPassword } = useAuthenticator();
  
        return (
          <View textAlign="center">
            <Button
              fontWeight="normal"
              onClick={toResetPassword}
              size="small"
              variation="link"
            >
              Reset Password
            </Button>
            <Divider orientation="horizontal" />
            <Text>
              {
                !isAuthenticated && (
                  <View
                    as="div"
                    backgroundColor="var(--amplify-colors-white)"
                    borderRadius="6px"
                    color="var(--amplify-colors-blue-60)"
                    height="4rem"
                    maxWidth="100%"
                    padding="1rem"
                    >
                    <Button
                      variation="primary"
                      onClick={
                        () => {
                          Auth.federatedSignIn({ customProvider: oidcProviderName });
                        }}
                    >
                      Sign In with {oidcProviderName}
                    </Button>
                  </View>
                )
              }
            </Text>            
          </View>
        );
      },
    },    
  };
  
  return (
    <Authenticator components={components} loginMechanisms={['email']}>
      {({ signOut, user }) => (
        <Flex
          direction="column"
          justifyContent="flex-start"
          alignItems="center"
          alignContent="flex-start"
          wrap="nowrap"
          gap="1rem"
          textAlign="center"
        >
          <View width="100%">
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
                
                <footer className={styles.footer}>
                  <h6>Welcome {user?.attributes?.email},
                    <Button
                      variation="link"
                      loadingText=""
                      onClick={() => signOut()}
                      ariaLabel=""
                    >
                      Sign Out!
                    </Button>
                  </h6>
                </footer>
              </div>
        
            </div>
          </View>
        </Flex>
      )}
    </Authenticator>    
  )
}