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

// The Link presentational component only specifies the appearance of the link
// when it is active or inactive. It does not know about behaviour.
// The children is the contents of the link, in this case either 'All', 'Active'
// or 'Completed'.
// The children get passed to the a tag so a parent component can specify
// the text of the link, making it more reusable.
const Link = ({ active, onClick, children }) => {
  // If link is active or selected, don't make it clickable.
  if (active) {
    return (
      <span>{children}</span>
    )
  }
  return (
    <a href="#"
      onClick={(e) => {
        e.preventDefault(); // prevent navigation when clicked
        onClick();
      }}
    >
      {children}
    </a>
  );
};

// ownProps refers to the container component's ownProps,
// not the props that are passed to the child,
// which is the return value of mapStateToLinkProps.
const mapStateToLinkProps = ( state, ownProps ) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
}

const mapDisptachToLinkProps = (dispatch, ownProps) => {
  return {
    onClick:() => {
      dispatch({
       type: 'SET_VISIBILITY_FILTER',
       filter: ownProps.filter
     });
    }
  }
}

// mapStateToProps and mapDisptachToProps describe a container
// component so well, that instead of writing a container from
// scratch we can generate it using the connect function provided
// by ReactRedux.
const {connect} = ReactRedux;

// The FilterLink container component provides the data and behaviour for the
// presentational Link component.
// It subscribes to the store, calling forceUpdate any time the store changes
// so it can re-render the Link with the current state.
// Every FilterLink component instance is subscribed to the store, so they will
// all have their forceUpdate methods called when the redux state changes.
const FilterLink = connect(
  mapStateToLinkProps,
  mapDisptachToLinkProps
)(Link);

const {Component} = React;


// Footer is a presentational component.
// It renders the three filter links.
const Footer = () => {
  return (
    <p>
      Show:

      {' '}
      <FilterLink
        filter='SHOW_ALL'
      >
        All
      </FilterLink>

      {' '}
      <FilterLink
        filter='SHOW_ACTIVE'
      >
        Active
      </FilterLink>

      {' '}
      <FilterLink
        filter='SHOW_COMPLETED'
      >
        Comlpeted
      </FilterLink>
    </p>
  )
};

// Todo is a presentational component. It does not specify any behaviour, and is
// only concerned with how things look or render. Eg, the onclick handler is a prop.
// This way anyone who uses the component can specify what happens on the click.
// Rather than receiving the entire todo object, we are explicit, and take only the
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

// TodoList is a presentational component that receives the currently visible
// todos and the onTodoClick callback.
// It maps over the todos array, and for each one renders a Todo component.
// To each Todo component it passes the todo properties (with the spread operator)
// and the onTodoClick handler with the id of the particular todo.
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

// mapStateToProps takes the state of the redux store and returns the props for the
// presentational component calculated from the state.
// It maps the redux store state to the props of the component.
// These props will be updated any time the state changes.
const mapStateTodoListProps = (state) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  }
}
// mapDisptachToProps defines which callback prop dispatches which action.
// It returns the callback props needed for the presentational
// component.
// It maps the dispatch method of the store to the callback props of
// the component.
const mapDisptachTodoListProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch({
        type: 'TOGGLE_TODO',
        id,
      })
    }
  }
}

// VisibleTodoList is a container component generated by connect.
const VisibleTodoList = connect(
  mapStateTodoListProps,
  mapDisptachTodoListProps
)(TodoList);

// AddTodo is neither a container or a presentational component.
// It renders an input and a button.
// The input uses React's callback ref api.
// ref is a function that gets the node corresponding to the ref.
// We save the node to input variable.
// This allows us to later read the value of the input and reset it.
// When the button is clicked it dispatches an action to the store with
// the value of the todo.
// AddTodo doesn't need to access the store, so it simply accepts dispatch
// as a prop.
let AddTodo = ({dispatch}) => {
  let input;
  return (
    <div>
      <input ref={node => {
        input = node;
      }} />
      <button onClick={() => {
        dispatch({
          type: 'ADD_TODO',
          text: input.value,
          id: nextTodoId++,
        });
        // Reset the input value after dispatching the action so that
        // the field is cleared.
        input.value = '';
      }}>
        Add Todo
      </button>
    </div>
  )
};
// The first argument to the connect fn is mapStateToProps.
// We can pass null to tell redux there is no need to subscribe to
// the store, because there are no props for the AddTodo component
// that depend on the current state.
// The second argument to the connect fn is mapDispatchToProps.
// AddTodo just accepts the dispatch fn itself, so we can simply pass
// dispatch.
// But when you pass nothing to connect the default behaviour is to
// generate a container component that does not to subscribe to the store
// and to inject the dispatch fn as a prop.
// So we can call connect without passing anything to generate our AddTodo container.
// Finally we call AddTodo for a second time to specify the component
// I want to wrap.
// We no longer have reference to our inner AddTodo component, we only reference the
// AddTodo container from now on.
AddTodo = connect()(AddTodo)

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

// We create a TodoApp container component.
// It renders several child components, which in turn render many
// presentational components.
// VisibleTodoList and Footer are container components, which subscribe
// to the store and update themselves when the store state changes.
// All dispatching to the redux store happens in the container components.
// The presentation components are only concerned with how things look.
// They do not know about the redux store.
const TodoApp = () => {
  return (
    <div>
      <AddTodo/>
      <VisibleTodoList/>
      <Footer/>
    </div>
  )
}

// We can wrap any component in a Provider and it is going to render that component.
// Provider makes the store available to any component inside it, including grandchildren.
// The store will be part of the context this the Provider provides for any of its children
// and grandchildren.
const {Provider} = ReactRedux;

// createStore receives our top-level todoApp reducer.
const { createStore } = Redux;

// We render the TodoApp container once initially.
// We render it inside the Provider component, where we pass the store as a prop.
// Provider just renders whatever you pass to it (its children), in this case the TodoApp component.
// It also provides the context, in this case the store, to any components inside it, including grandchildren.
ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp/>
  </Provider>,
  document.getElementById('root')
);
