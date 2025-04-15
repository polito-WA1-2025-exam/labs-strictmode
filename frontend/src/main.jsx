import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {Home, Login, Cart, Establishments} from "./pages/index"

const router = createBrowserRouter([
  {
    path: "/*",
    element: <Home/>,
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/cart",
    element: <Cart />,
  },
  {
    path: "/establishments",
    element: <Establishments />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
