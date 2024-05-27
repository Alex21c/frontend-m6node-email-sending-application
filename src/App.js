import './App.css';
import './Assests/fontAwesomeProIcons/fontAwesomeIcons.css';
import SuccessAndErrorMsg, {showError, hideError, showSuccess} from "./Components/Notifications/SuccessAndErrorMsg";
import { useEffect, useRef, useState } from 'react';

function App() {
  const refEmail = useRef(null);
  const refFirstName = useRef(null);
  const refLastName = useRef(null);
  let [stateIsEmailBeingSent, setStateIsEmailBeingSent] = useState(false); 
  let [stateEmailSentResponse, setStateEmailSentResponse] = useState(null);

  // fetching initial state from local storage
    let initialHandshakState = localStorage.getItem('Alex21CemailSendingStockMarketQuote');
    if(initialHandshakState){
      initialHandshakState = JSON.parse(initialHandshakState);
    }else{
      initialHandshakState = {
        handshakeInfo: {
          success: false,
          timestamp: new Date()
        }
      };
    }
    let [stateHandshake, updateStateHandshake] = useState(initialHandshakState)

  const apiURLs= {
    localhost:{
      'send-email': "http://localhost:4000/api/v1/send-email/stock-market-quote",
      'handshake': "http://localhost:4000/api/v1/send-email/handshake/hello",
    },
    render:{
      'send-email': "https://m6node-email-sending-application.onrender.com/api/v1/send-email/stock-market-quote",
      'handshake': "https://m6node-email-sending-application.onrender.com/api/v1/send-email/handshake/hello",
    }    
  }
  function isTimeStamp10MinutesOlder(previousTimeStamp){
    // console.log(previousTimeStamp);
    previousTimeStamp = new Date(previousTimeStamp)
    let currentTimestamp = new Date();
    let tenMinues = 10*60*1000;
    // let tenMinues = 1000;
    let difference = currentTimestamp- previousTimeStamp;
    // console.log(difference)
    if(difference > tenMinues){
      return true;
    }else{
      return false;
    }
  
  }
  
  async function performHandshakeWithServer(apiURLs, updateStateHandshake){
    try {
      console.log('performing handshake with server');
      // throw new Error('testing')
        
      const requestOptions = {
        method: "GET"
      };    
      let response = await fetch(apiURLs.render.handshake, requestOptions);
      if(!response){       
        throw new Error("Unable to to process current request!");
      }
      response = await response.json();        
      // console.log(response);
      // save it into state   
        const handshakeInfo= {
          success: response.success,
          timestamp: new Date()
        };
  
      // console.log(handshakeInfo);
      updateStateHandshake(previousState=>{
        return {
          ...previousState,
          handshakeInfo: handshakeInfo 
        }
      })
  
  
    } catch (error) {    
      console.log("ERROR: " + error.message);
      console.log('unable to perform handshake with the server!');
    }
  }

  // initially perform a handshake with the render server, if it has been spin off
  useEffect(()=>{
    // first check the local strogage about when was the last handshake performed
    // if more than 10 minutes have been passed then re perform handshake
      
    const makeAsyncCall = async ()=>{        
      await performHandshakeWithServer(apiURLs, updateStateHandshake);
    };
  
    let doIneedToPerformHandshake = false;
    if(stateHandshake?.handshakeInfo){      
      // is it fresh or 10 minutes have been passed
        if(isTimeStamp10MinutesOlder(stateHandshake?.handshakeInfo?.timestamp)){
          doIneedToPerformHandshake=true;
          // console.log('isTimeStamp10MinutesOlder')
        }
      // just check is last time there was failure response in handshake?
        else if(stateHandshake.handshakeInfo.success === false){
          doIneedToPerformHandshake=true;
        }
        
    }

    if(doIneedToPerformHandshake){
      makeAsyncCall();
    }
    
  }, []);

  let [stateSuccessAndErrorMsg, updateStateSuccessAndErrorMsg] = useState({
    style: {
      Success: "text-green-300 text-[1.5rem]",
      Error: "text-red-300 text-[1.5rem]"
    },
    msgType: "Success",
    msg: "",
    displayNone: 'displayNone'        
  
  });

  function handleSendEmailReq(event){    
    event.preventDefault();
    // safeguard
      if(stateIsEmailBeingSent){
        return;
      }

    //console.log('listening...');
    // Safeguard
      if(refEmail.current.value === "" || refFirstName.current.value === "" || refLastName.current.value === ""){
        return;
      }

    // making fetch req.
      async function makeAPICall(event){
        // console.log('making api call!');
        try {
          setStateIsEmailBeingSent(true);
          const form = event.target;
          const formData = new FormData(form);
          // console.log(formData);
          const urlEncodedData = new URLSearchParams(formData).toString();
          // console.log(urlEncodedData);
          const options={
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlEncodedData
       
  
          }
          let response = await fetch(apiURLs.render['send-email'], options);
          if(response){
            response = await response.json();
            if(response.success){
              showSuccess(updateStateSuccessAndErrorMsg, response.message);
            }else{
              showError(updateStateSuccessAndErrorMsg, response.message);
            }
            setStateEmailSentResponse(response)
            
            // console.log(response);
          }
          
        } catch (error) {
          console.log('ERROR: ', error.message)
        } finally{
          setStateIsEmailBeingSent(false);
        }

      }

      makeAPICall(event);
    
      

    
  } 

  return (
    <div className='pageWrapper mt-[2rem] pt-[1rem] p-[2rem] max-w-[120rem]  m-auto rounded-md  text-[1.2rem] text-stone-200 flex flex-col gap-[2rem] items-center'>

      <h2 className="text-[1.8rem] flex flex-col gap-[.2rem] items-center mt-[-2rem]">
        <i className="fa-solid fa-envelope text-[2.5rem] hover:text-yellow-300 transition"></i>
        <span className="font-medium">Email Sending Application</span>
      </h2>
      {

      stateEmailSentResponse ===null ?
        <form onSubmit={handleSendEmailReq}  className="signInForm flex flex-col gap-[.5rem] w-[20rem]" method="post" >
          <input ref={refFirstName} type="text" placeholder="First name" className=" text-stone-700 transition focus:outline focus:outline-2 focus:outline-green-500 p-[1rem] pr-[3rem] rounded-md bg-stone-200 relative w-[100%]" name='firstName'/>
          <input ref={refLastName} type="text" placeholder="Last name" className=" text-stone-700 transition focus:outline focus:outline-2 focus:outline-green-500 p-[1rem] pr-[3rem] rounded-md bg-stone-200 relative w-[100%]" name='lastName'/>
          <input ref={refEmail} type="email" placeholder="e-mail" className=" text-stone-700 transition focus:outline focus:outline-2 focus:outline-green-500 p-[1rem] pr-[3rem] rounded-md bg-stone-200 relative w-[100%]" name='email'/>
          
          <SuccessAndErrorMsg  stateSuccessAndErrorMsg={stateSuccessAndErrorMsg}/> 
          <button type="submit" className={`outline-amber-50  transition cursor-pointer px-[1.3rem] py-[.3rem] rounded-md hover:text-slate-50 text-stone-700 text-[1.5rem] flex gap-[.5rem] items-center justify-center ${stateIsEmailBeingSent===false ? "bg-yellow-300 hover:bg-yellow-500": "bg-stone-300 hover:bg-stone-500"}`}>
                <i className="fa-solid fa-envelope  text-[3rem]"></i>
                <span className="text-[1.5rem] font-medium leading-[1.5rem]">
                  {stateIsEmailBeingSent ? "Sending you a quote Wait..." : "Send me a Stock Market Quote"}
                  
                  </span>
              </button>
        </form>
      :
       <SuccessAndErrorMsg  stateSuccessAndErrorMsg={stateSuccessAndErrorMsg}/> 
      }

    



    </div>

  );
}

export default App;
