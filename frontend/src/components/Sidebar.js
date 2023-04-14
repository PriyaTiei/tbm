 
import { useSelector, useDispatch } from "react-redux";
import { Offcanvas } from "react-bootstrap";
import { navBarSlice } from "../redux/navbarSlice";


export   function AppSidebar({ children }) { 
  const { visible } = useSelector((state) => state.navBar);
// const { activeItem } = useSelector((state) => state.navBar);
const dispatch = useDispatch();

// const handleItemClick = (value) => {
//   dispatch(navBarSlice.actions.setActiveItem(value));
// };
  return (
    <>
     

      <Offcanvas show={visible} onHide={() => dispatch(navBarSlice.actions.setVisible(false))}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          
        </Offcanvas.Body>
      </Offcanvas>

      <div className="sidebar-content">{children}</div>
    </>
  );
}

 