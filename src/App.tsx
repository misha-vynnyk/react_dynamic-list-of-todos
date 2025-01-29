/* eslint-disable max-len */
// #region import
import React, { useEffect, useMemo, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { getTodos, getUser } from './api';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';

import { Todo } from './types/Todo';
// #endregion import

export const App: React.FC = () => {
  // #region State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openTodoId, setOpenTodoId] = useState<number | null>(null);

  const [todosLoading, setTodosLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [filterValue, setFilterValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // eslint-disable-next-line no-console
  console.log('Render');

  useEffect(() => {
    setTodosLoading(true);

    getTodos()
      .then(data => {
        setTodos(data);
      })
      .finally(() => setTodosLoading(false));
  }, []);

  useEffect(() => {
    if (!currentTodo || currentTodo.user) {
      return;
    }

    getUser(currentTodo.userId)
      .then(user => {
        setCurrentTodo(prevTodo => {
          if (prevTodo?.id === currentTodo.id) {
            return { ...prevTodo, user };
          }

          return prevTodo;
        });
      })
      .finally(() => setModalLoading(false));

    // // eslint-disable-next-line no-console
    // console.log('Modal state:', isModalOpen, 'ModalLoader:', modalLoading);
  }, [currentTodo]);

  // #endregion State

  // #region Handler

  const handleOpenModal = (todo: Todo): void => {
    setOpenTodoId(todo.id);
    setModalLoading(true);
    setIsModalOpen(true);

    setCurrentTodo(todo);
  };

  const filteredAndSearchedTodos = useMemo(() => {
    return todos
      .filter(todo => {
        if (filterValue === 'completed') {
          return todo.completed === true;
        } else if (filterValue === 'active') {
          return todo.completed === false;
        }

        return true;
      })
      .filter(todo => {
        return todo.title.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [todos, filterValue, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setCurrentTodo(null);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // #endregion Handler
  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                setFilterValue={setFilterValue}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                handleClearSearch={handleClearSearch}
              />
            </div>

            <div className="block">
              {todosLoading && <Loader />}
              <TodoList
                todos={filteredAndSearchedTodos}
                handleOpenModal={handleOpenModal}
                isModalOpen={isModalOpen}
                openTodoId={openTodoId}
              />
            </div>
          </div>
        </div>
      </div>

      <TodoModal
        currentTodo={currentTodo}
        isModalOpen={isModalOpen}
        modalLoading={modalLoading}
        handleCloseModal={handleCloseModal}
      />
    </>
  );
};
