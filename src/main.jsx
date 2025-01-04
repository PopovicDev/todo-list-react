import { StrictMode, useState, useReducer, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

(()=>{
  if(localStorage.getItem('TasksMem') === null){
    localStorage.setItem('TasksMem', '[]');
  }
})();

function App(){
  return (
    <>
      <h1>TO-DO LIST</h1>
      <Table tasks={JSON.parse(localStorage.getItem('TasksMem') || '[]')}/>
    </>
  )
}

function reducerf(state, action){
  switch(action.type){
    case 'adding':{
      const newTask = {text: action.text, date:action.date, status:false, id:action.id};
      const updatedTasks = [...state.tasks, newTask];
      localStorage.setItem('TasksMem', JSON.stringify(updatedTasks));
      return {tasks:updatedTasks};
    }
    case 'finishing':{
      const updatedTasks = state.tasks.map(el => 
        el.id === action.id ? {...el, status: true} : el
      );
      localStorage.setItem('TasksMem', JSON.stringify(updatedTasks));
      return {tasks: updatedTasks};
    }
    case 'deleting':{
      const updatedTasks = state.tasks.filter(el=>el.id !== action.id);
      const reindexedTasks = updatedTasks.map((el, ind) => ({
        ...el,
        id: ind
      }));
      localStorage.setItem('TasksMem', JSON.stringify(reindexedTasks));
      return {tasks:reindexedTasks};
    }
    case 'editing':{
      const updatedTasks = state.tasks.map(el => el.id === action.id ? {...el, text:action.text, date:action.date} : el);
      localStorage.setItem('TasksMem', JSON.stringify(updatedTasks));
      return {tasks: updatedTasks};
    }
    default:
      return state;
  }
};

function Table(props){
  const [status, setStatus] = useState('active');
  const [edit, setEdit] = useState({
    editing:'off',
    text:'',
    date:'',
    id:null
  });
  const [state, dispatch] = useReducer(reducerf, {tasks:props.tasks});

  return (
    <div className='table'>
      {edit.editing == 'on' && <EditComponent text={edit.text} date={edit.date} id={edit.id} dispatch={dispatch} editingf={setEdit}/>}
      <Inputs dispatch={dispatch} length={state.tasks.length}/>
      <Tasks tasks={JSON.stringify(state.tasks)} dispatch={dispatch} status={status} editingf={setEdit}/>
      <Filtering changeStatus={setStatus} status={status}/>
    </div>
  )
}

function Inputs({dispatch, length}){
  let text = useRef('');
  let date = useRef('');
  return (
    <div className='inputs'>
      <input type='text' ref={text} placeholder='Type in your Task...'/>
      <input type='date' ref={date}/>
      <button onClick={()=>{
        if(text.current.value.trim() === '' || date.current.value === '') {
          alert('Please fill in both fields!');
          return;
        }
        dispatch({
      type:'adding',
      text:text.current.value,
      date:date.current.value,
      id:length
      });
      text.current.value = '';
      date.current.value = '';
      }}>ADD TASK</button>
    </div>
  )
}

function Tasks({tasks, dispatch, status, editingf}){
  let parsedTasks = JSON.parse(tasks);
  const filtered = {
    all: parsedTasks,
    active: parsedTasks.filter(el => !el.status),
    done: parsedTasks.filter(el => el.status)
  }[status] || parsedTasks.filter(el => !el.status);
  return (
    <div className='tasks'>
      {filtered.map(el=><Task key={el.id} text={el.text} date={el.date} id={el.id} status={status} elstatus={el.status} dispatch={dispatch} setedit={editingf}/>)}
    </div>
  )
}

function Task({text, date, id, status, elstatus, dispatch, setedit}){
  return (
    <div className='task'>
      <p>{text}</p>
      <div>
        <p id='issued'>Issued on:<br/>{date}</p>
        <div className='task-buttons'>
        {!elstatus && <button onClick={()=>{dispatch({type:'finishing', id:id})}}><i className="fa-solid fa-check"/></button>}
        {!elstatus && <button onClick={()=>{dispatch({type:'editing', text:text, date:date, id:id}); setedit({editing:'on', text:text, date:date, status:status, id:id});}}><i className="fa-solid fa-pen-to-square"/></button>}
        <button onClick={()=>{dispatch({type:'deleting', id:id})}}><i className="fa-solid fa-xmark"/></button>
        </div>
      </div>
    </div>
  )
}

function EditComponent({text, date, id, dispatch, editingf}){
  const [txt, setTxt] = useState(text);
  const [dt, setDt] = useState(date);

  return (
    <div className='editcomp'>
      <div className='inputs'>
      <input type='text' value={txt} placeholder='Type in your Task...' onChange={(e)=>setTxt(e.target.value)}/>
      <input type='date' value={dt} onChange={(e)=>setDt(e.target.value)}/>
      <button onClick={()=>{
        if(txt.trim() === '' || dt.value === '') {
          alert('Please fill in both fields!');
          return;
        };
        dispatch({
          type:'editing',
          text:txt,
          date:dt,
          id:id
        });
        editingf({
          editing:'off',
          text:'',
          date:'',
          id:null
        });
      }}>EDIT TASK</button>
      </div>
    </div>
  )
}

function Filtering({changeStatus, status}){
  return (
    <div className='filtering'>
      <button className={status == 'all' ? 'activated-button' : undefined} onClick={()=>changeStatus('all')}>ALL</button>
      <button className={status == 'active' ? 'activated-button' : undefined} onClick={()=>changeStatus('active')}>ACTIVE</button>
      <button className={status == 'done' ? 'activated-button' : undefined} onClick={()=>changeStatus('done')}>DONE</button>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
