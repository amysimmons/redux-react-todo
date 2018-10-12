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

let nextTodoId = 0;

// We create a TodoApp class that extends the base Component class.
class TodoApp extends Component {
  render() {
    return (
        // The input uses React's callback ref api.
        // ref is a function that gets the node corresponding to the ref
        // We save the node to this.input.
        // This allows us to later read the value of the input and reset it.

        // The 'Add todo' button dispatches a redux action when clicked.
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
          // reset the input value after dispatching the action so that
          // the field is cleared
          this.input.value = '';
        }}>
          Add Todo
        </button>
        <ul>
          {this.props.todos.map((todo) => {
            return (
              <li key={todo.id}>
                {todo.text}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

// This render function will get called every time a redux action is dispatched.
// It gets the latest todos state from the store and passes them as props.
const render = () => {
  ReactDOM.render(
    <TodoApp
      todos={store.getState().todos}/>,
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
