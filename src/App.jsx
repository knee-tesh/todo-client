import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Footer from "./footer";
import "./App.css";

const url = import.meta.env.VITE_BASE_URL;

export const App = () => {
  const [newTask, updateTask] = useState();
  const [tasks, updateTasks] = useState([]);
  const statuses = ["New", "In Progress", "Completed", "Done"];

  useEffect(() => {
    const getInitialData = async () => {
      const response = await fetch(url);
      const data = await response.json();
      updateTasks([...data]);
    };
    getInitialData();
  }, []);

  const handleAddTask = async () => {
    if (newTask === undefined || newTask === "") return;
    const params = {
      name: newTask,
      status: "New",
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params), // body data type must match "Content-Type" header
    });
    const todo = await response.json();
    updateTasks([...tasks, todo]);
    updateTask("");
  };
  const handleKeyDown = (e) => {
    const value = e.target.value;
    if (e.keyCode == 13) {
      updateTask(value);
      handleAddTask();
    }
  };
  const handleChangeStatus = (task) => async (status) => {
    let method = "POST";
    task.status = status;
    if (status === "Delete") method = "DELETE";
    const subPath = method === "POST" ? "/update" : "/delete";
    const newUrl = url + subPath;
    const response = await fetch(newUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    const todo = await response.json();
    console.log({ todo });
    updateTasks([...tasks]);
  };
  return (
    <div className="main-wrapper">
      <h2 className="header">Task Board</h2>
      <p className="sub-header">
        Add New Tasks and move them around as they progress
      </p>
      <div>
        <input
          className="addTask"
          value={newTask}
          onChange={(e) => updateTask(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="addTaskButton" onClick={() => handleAddTask()}>
          Add Task{" "}
        </button>
      </div>
      <div className="board-wrapper">
        {statuses.map((stat, ind) => (
          <div key={`${ind}-${stat}`} className="board-status">
            <div className="sub-header">{stat}</div>
            {tasks &&
              tasks
                .filter((task) => task.status === stat)
                .map((task, index) => (
                  <TaskCard
                    key={index}
                    task={task}
                    handleChangeStatus={handleChangeStatus(task)}
                    statuses={statuses}
                  />
                ))}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

const TaskCard = ({ task, handleChangeStatus, statuses }) => {
  const options = [...statuses, "Delete"];
  const handleSelect = (e) => {
    const value = e.target.value;
    handleChangeStatus(value);
  };

  return (
    <div className="task">
      <div className="taskName">{task.name}</div>
      <select
        className="taskSelect"
        value={task.status}
        onChange={handleSelect}
      >
        {options.map((opt, index) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.object.isRequired,
  handleChangeStatus: PropTypes.func.isRequired,
  statuses: PropTypes.array,
};

export default App;
