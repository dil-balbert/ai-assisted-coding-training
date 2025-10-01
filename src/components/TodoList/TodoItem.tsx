import React from 'react';
import {
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Divider,
  Typography,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import type { Todo } from '../../types/Todo';
import { useTodo } from '../../hooks/useTodo';

interface TodoItemProps {
  todo: Todo;
  onEditClick: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEditClick }) => {
  const { toggleTodoCompletion, deleteTodo } = useTodo();

  const isOverdue =
    todo.dueDate &&
    !todo.completed &&
    new Date(todo.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <>
      <ListItem
        sx={{
          bgcolor: 'background.paper',
          py: 1,
          borderLeft: todo.completed ? '4px solid green' : '4px solid transparent',
          '&:hover': {
            bgcolor: 'action.hover',
            cursor: 'pointer',
          },
        }}
        onClick={() => onEditClick(todo)}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={e => {
              e.stopPropagation();
              deleteTodo(todo.id);
            }}
          >
            Delete
          </IconButton>
        }
      >
        <Checkbox
          edge="start"
          checked={todo.completed}
          onClick={e => {
            e.stopPropagation();
            toggleTodoCompletion(todo.id);
          }}
          color="primary"
          sx={{ mr: 1 }}
        />
        <ListItemText
          disableTypography
          primary={
            <Typography
              variant="body1"
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.secondary' : 'text.primary',
                fontWeight: 500,
              }}
            >
              {todo.title}
            </Typography>
          }
          secondary={
            <>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                }}
              >
                {todo.description}
              </Typography>
              {todo.dueDate && (
                <div
                  style={{
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    Due: {format(new Date(todo.dueDate), 'PP')}
                  </Typography>
                  {isOverdue && (
                    <Chip
                      label="Overdue"
                      size="small"
                      color="error"
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                  )}
                </div>
              )}
            </>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};
