// todo is a reducer that is called by the todos reducer
// and is used to delegate and abstract away the creating or
// updating of inidivdual todos.
// Here, the first argument 'state' is actually the individual todo.
const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }

      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

// This is a reducer. All reducers take the previous state,
// the action being dispatched, and return the next state.
// This reducer calls handles the updating of the state for each
// todo-related action, but it calls another reducer called 'todo'
// to handle the creating / updating of the todo itself.
const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      return state.map(t =>
        todo(t, action)
      );
    default:
      return state;
  }
};

// This is a reducer. All reducers take the previous state,
// the action being dispatched, and return the next state.
const visibilityFilter = (
  state = 'SHOW_ALL',
  action
) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

// combineReducers produces the top-level reducer for the app
// it takes an object that specifies which sub reducer will be
// responsible for managing each piece of state.
// Here, the todos reducer will handle actions relating to our todos
// and return the appropriate state.
// Similarly, the visibilityFilter will handle actions relating to
// the visibility filter and return the appropriate state.
const { combineReducers } = Redux;
const todoApp = combineReducers({
  todos,
  visibilityFilter
});

// createStore receives our top-level todoApp reducer.
const { createStore } = Redux;
const store = createStore(todoApp);

// Component is a base class for all react components.
const { Component } = React;

// The user clicks the FilterLink to switch the current visible todos.
// The filter prop is a string indicating whether the user wants to
// show all, show active or show completed.
// The currentFilter prop allows us to style the currently selected filter
// different to the others.
// The children is the contents of the link, in this case either 'All', 'Active'
// or 'Completed'.
// The children get passed to the a tag so the parent component can specify
// the text of the link, making it more reusable.
const FilterLink = ({ filter, currentFilter, children }) => {
  // if the filter is the current filter, don't make it clickable
  if (filter === currentFilter) {
    return (
      <span>{children}</span>
    )
  }
  return (
    <a href="#"
      onClick={(e) => {
        e.preventDefault(); // prevent navigation when clicked
        store.dispatch({
          type: 'SET_VISIBILITY_FILTER',
          filter
        });
      }}
    >
      {children}
    </a>
  );
};

// Todo is a presentational component. It does not specify any behaviour, and is
// only concerned with how things look or render. Eg, the onclick handler is a prop.
// This way anyone who uses the component can specify what happens on the click.
// Rather than passing the entire todo object, we are explicit, and pass only the
// data that the component needs to render.
const Todo = ({onClick, completed, text}) => {
  return (
    <li
        onClick={onClick}
        style={{
          textDecoration: completed ? 'line-through' : 'none'
        }}>
      {text}
    </li>
  );
};

// Like Todo, TodoList is also a presentational component.
const TodoList = ({todos, onTodoClick}) => {
  return (
    <ul>
      {
        todos.map((todo) => {
          return (
            <Todo
              key={todo.id}
              {...todo}
              onClick={() => onTodoClick(todo.id)}/>
          )
        })
      }
    </ul>
  );
};

const getVisibleTodos = (todos, filter) => {
  switch(filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
  }
}

let nextTodoId = 0;

// We create a TodoApp class that extends the base Component class.
class TodoApp extends Component {
  render() {
    const {todos, visibilityFilter} = this.props;
    const visibleTodos = getVisibleTodos(
      todos,
      visibilityFilter
    );

    return (
        // The input uses React's callback ref api.
        // ref is a function that gets the node corresponding to the ref
        // We save the node to this.input.
        // This allows us to later read the value of the input and reset it.

        // The 'Add todo' button dispatches an action when clicked.

        // We render a TodoList and pass a function so that each todo can dispatch
        // a toggle action when clicked.
      <div>
        <input ref={node => {
          this.input = node;
        }} />
        <button onClick={() => {
          store.dispatch({
            type: 'ADD_TODO',
            text: this.input.value,
            id: nextTodoId++,
          });
          // Reset the input value after dispatching the action so that
          // the field is cleared.
          this.input.value = '';
        }}>
          Add Todo
        </button>
        <TodoList
          todos={visibleTodos}
          onTodoClick={
            (id) => {
              store.dispatch({
                type: 'TOGGLE_TODO',
                id,
              });
            }
          }/>
        <p>
          Show:

          {' '}
          <FilterLink
            filter='SHOW_ALL'
            currentFilter={visibilityFilter}
          >
            All
          </FilterLink>

          {' '}
          <FilterLink
            filter='SHOW_ACTIVE'
            currentFilter={visibilityFilter}
          >
            Active
          </FilterLink>

          {' '}
          <FilterLink
            filter='SHOW_COMPLETED'
            currentFilter={visibilityFilter}
          >
            Comlpeted
          </FilterLink>
        </p>
      </div>
    )
  }
}

// This render function will get called every time a redux action is dispatched.
// It gets the latest todos state from the store and passes them as props.
// We pass every property in the global redux state object as a prop to the
// TodoApp component with the spread operator.
const render = () => {
  ReactDOM.render(
    <TodoApp
    {...store.getState()}/>,
    document.getElementById('root')
  );
}

// subscribe lets you register a function that will be called every time
// an action is dispatched, so that you can update the UI to reflect
// the new application state.
store.subscribe(render);

// We also need to call render once at the start of our
// application to render the initial state.
render();
