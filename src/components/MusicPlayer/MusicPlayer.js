import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { TasksModel, CategoriesModel } from "../../services/db";

// Styled components
const TaskListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  ${(props) =>
    props.completed &&
    `
    opacity: 0.7;
  `}
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const TaskTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  word-break: break-word;

  ${(props) =>
    props.completed &&
    `
    text-decoration: line-through;
    color: #777;
  `}
`;

const TaskPriority = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;

  ${(props) => {
    if (props.priority === "high") {
      return `
        background-color: #ffebee;
        color: #e53935;
      `;
    } else if (props.priority === "medium") {
      return `
        background-color: #fff8e1;
        color: #ffa000;
      `;
    } else {
      return `
        background-color: #e8f5e9;
        color: #43a047;
      `;
    }
  }}
`;

const TaskDescription = styled.p`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
  word-break: break-word;

  ${(props) =>
    props.completed &&
    `
    color: #999;
  `}
`;

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.8rem;
`;

const TaskMetadata = styled.div`
  display: flex;
  gap: 1rem;
`;

const TaskDate = styled.div`
  color: ${(props) => (props.isOverdue ? "#e53935" : "#666")};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TaskCategory = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background-color: ${(props) => props.color || "#e0e0e0"};
  color: white;
  border-radius: 4px;
  font-weight: 500;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 10px;
  color: #666;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 0.9rem;
  min-width: 120px;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 0.9rem;
  flex-grow: 1;
  min-width: 200px;

  &::placeholder {
    color: #aaa;
  }
`;

// Task Item Component
const TaskItem = ({ task, categories, onEdit, onDelete, onStatusChange }) => {
  const [category, setCategory] = useState(null);

  useEffect(() => {
    // Find the category for this task
    const taskCategory = categories.find((cat) => cat.id === task.categoryId);
    setCategory(taskCategory || null);
  }, [task.categoryId, categories]);

  // Handle status toggle
  const handleStatusToggle = () => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    onStatusChange(task.id, newStatus);
  };

  // Format date helper
  const formatDate = (date) => {
    if (!date) return null;
    return format(new Date(date), "dd MMM yyyy");
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.dueDate || task.status === "completed") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <TaskCard completed={task.status === "completed"}>
      <TaskHeader>
        <TaskTitle completed={task.status === "completed"}>
          {task.title}
        </TaskTitle>
        <TaskPriority priority={task.priority}>{task.priority}</TaskPriority>
      </TaskHeader>

      {task.description && (
        <TaskDescription completed={task.status === "completed"}>
          {task.description}
        </TaskDescription>
      )}

      <TaskFooter>
        <TaskMetadata>
          {task.dueDate && (
            <TaskDate isOverdue={isOverdue()}>
              <i className="material-icons" style={{ fontSize: "1rem" }}>
                event
              </i>
              {formatDate(task.dueDate)}
            </TaskDate>
          )}

          {category && (
            <TaskCategory color={category.color}>
              <i className="material-icons" style={{ fontSize: "1rem" }}>
                {category.icon || "folder"}
              </i>
              {category.name}
            </TaskCategory>
          )}
        </TaskMetadata>

        <TaskActions>
          <ActionButton
            onClick={handleStatusToggle}
            title={
              task.status === "completed"
                ? "Mark as incomplete"
                : "Mark as complete"
            }
          >
            <i className="material-icons">
              {task.status === "completed"
                ? "check_box"
                : "check_box_outline_blank"}
            </i>
          </ActionButton>

          <ActionButton onClick={() => onEdit(task)} title="Edit task">
            <i className="material-icons">edit</i>
          </ActionButton>

          <ActionButton onClick={() => onDelete(task.id)} title="Delete task">
            <i className="material-icons">delete</i>
          </ActionButton>
        </TaskActions>
      </TaskFooter>
    </TaskCard>
  );
};

// Main Component
const TaskList = ({ onEdit, onDelete }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, completed
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load tasks and categories
  useEffect(() => {
    Promise.all([TasksModel.getAllTasks(), CategoriesModel.getAllCategories()])
      .then(([taskData, categoryData]) => {
        setTasks(taskData);
        setCategories(categoryData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setLoading(false);
      });
  }, []);

  // Filter tasks based on criteria
  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (filter === "pending" && task.status === "completed") return false;
    if (filter === "completed" && task.status !== "completed") return false;

    // Category filter
    if (
      categoryFilter !== "all" &&
      task.categoryId !== parseInt(categoryFilter)
    )
      return false;

    // Priority filter
    if (priorityFilter !== "all" && task.priority !== priorityFilter)
      return false;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Handle status change
  const handleStatusChange = (taskId, newStatus) => {
    TasksModel.updateTaskStatus(taskId, newStatus)
      .then(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
      })
      .catch((error) => {
        console.error("Error updating task status:", error);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <FilterSection>
        <FilterSelect
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="pending">Belum Selesai</option>
          <option value="completed">Selesai</option>
        </FilterSelect>

        <FilterSelect
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Semua Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">Semua Prioritas</option>
          <option value="high">Tinggi</option>
          <option value="medium">Sedang</option>
          <option value="low">Rendah</option>
        </FilterSelect>

        <SearchInput
          type="text"
          placeholder="Cari tugas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </FilterSection>

      <TaskListContainer>
        {filteredTasks.length === 0 ? (
          <EmptyState>
            <p>Tidak ada tugas yang ditemukan</p>
            {filter !== "all" ||
            categoryFilter !== "all" ||
            priorityFilter !== "all" ||
            searchQuery ? (
              <p>Coba ubah filter pencarian Anda</p>
            ) : (
              <p>Tambahkan tugas baru untuk mulai menggunakan aplikasi</p>
            )}
          </EmptyState>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </TaskListContainer>
    </div>
  );
};

export default TaskList;
