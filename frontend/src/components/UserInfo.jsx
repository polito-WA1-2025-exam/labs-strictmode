import {PersonCircle, GooglePlay} from 'react-bootstrap-icons'
import "../css/UserInfo.css"
import { useState } from 'react'

export default function UserInfo() {
    return (
        <div className='extern-container'>
            <div className='inner-container'>
                <div className='horizontal-container'>
                    <h3>Surplus Food</h3>
                    <GooglePlay />
                </div>
                <div className='horizontal-container-username'>
                    <PersonCircle size={150}/>
                    <h3>Username</h3>
                </div>
                <Form1 assignedName="Michele" familyName="Carloni" email="myemail@gmail.com" password="password"/>
            </div>
        </div>
    )
}

function Form1(props) {

    const [isEditable, setIsEditable] = useState(false);
    const [assignedName, setAssignedName] = useState(props.assignedName);
    const [familyName, setFamilyName] = useState(props.familyName);
    const [email, setEmail] = useState(props.email);
    const [password, setPassword] = useState(props.password);

    const [original, setOriginal] = useState({
        assignedName: props.assignedName,
        familyName: props.familyName,
        email: props.email,
        password: props.password
    })

    const [buttonDisplay, setButtonDisplay] = useState(0);



    const onChangeAssignedName = (e) => {
        e.preventDefault();
        setAssignedName(e.target.value);
    }

    const onChangeFamilyName = (e) => {
        e.preventDefault();
        setFamilyName(e.target.value);
    }

    const onChangeEmail = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
    }

    const onChangePassword = (e) => {
        e.preventDefault();
        setPassword(e.target.value);
    }



    const handleEditable = (e) => {
        e.preventDefault();
        setButtonDisplay(1);
        setIsEditable(!isEditable);
    }

    const handleSave = (e) => {
        e.preventDefault();

        setOriginal({ assignedName, familyName, email, password });

        setButtonDisplay(0);
        setIsEditable(!isEditable);
    }

    const handleNull = (e) => {
        e.preventDefault();

        setAssignedName(original.assignedName);
        setFamilyName(original.familyName);
        setEmail(original.email);
        setPassword(original.password);

        setButtonDisplay(0);
        setIsEditable(!isEditable);
    }

    return(
        <div>
            <form className='form-container'>
                <input type="text" value={assignedName} readOnly={!isEditable} onChange={onChangeAssignedName} />
                <input type="text" value={familyName} readOnly={!isEditable} onChange={onChangeFamilyName}/>
                <input type="text" value={email} readOnly={!isEditable} onChange={onChangeEmail}/>
                <input type="text" value={password} readOnly={!isEditable} onChange={onChangePassword}/>
                {buttonDisplay === 0 && <button onClick={handleEditable}>Update</button>}
                {buttonDisplay === 1 && 
                <div className='horizontal-container'>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleNull}>Null</button>
                </div>}
            </form>
        </div>
    )
}