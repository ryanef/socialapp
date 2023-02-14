import {createRoot} from 'react-dom/client'

import Profile from './Profile/Profile'
const App = () => {
    return (
        <div className=" bg-purple-700 h-full ">
            <h1 className='text-white text-4xl mb-8 text-center'>RalliSpace</h1>
        <Profile/>
        </div>
    )
}

const container = document.getElementById('root');
const root = createRoot(container)
root.render(<App/>)
