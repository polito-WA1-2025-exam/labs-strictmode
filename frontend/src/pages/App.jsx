import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import {Home, Login, Cart, Establishments} from "./index.js";



function App() {
    return (
      <BrowserRouter>
        <Main/>
      </BrowserRouter>
    );
  }

/**
 * The actual main app.
 * This is used instead of the default App component because Main can be encapsulated in
 * a BrowserRouter component, giving it the possibility of using the useNavigate hook.
*/


function Main() {



    //Routes definition
    return (
        <Routes>
            <Route path = "/" element = {<Home/>}></Route>
            <Route path = "/login" element = {<Login/>}></Route>
            <Route path = "/cart" element = {<Cart/>}></Route>
            <Route path = "/establishments" element = {<Establishments/>}></Route>
            <Route path = "*" element = {<p>404 Not Found</p>}></Route>
        </Routes>
    )

}


export default App;