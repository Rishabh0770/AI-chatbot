let prompt=document.querySelector("#prompt")
let submitbtn=document.querySelector("#submit")
let chatContainer=document.querySelector(".chat-container")
let imagebtn=document.querySelector("#image")
let image=document.querySelector("#image img")
let imageinput=document.querySelector("#image input")
let voiceBtn = document.querySelector("#voice");
const sendBtn = document.querySelector("#send");

const Api_Url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDV6-qOyHvYLM-fogPGnrVQWxwA4jAO4n4"

let user={
    message:null,
    file:{
        mime_type:null,
        data: null
    }
}
 
async function generateResponse(aiChatBox) {

let text=aiChatBox.querySelector(".ai-chat-area")
    let RequestOption={
        method:"POST",
        headers:{'Content-Type' : 'application/json'},
        body:JSON.stringify({
            "contents":[
                {"parts":[{text:user.message},(user.file.data?[{inline_data:user.file}]:[])

                ]
            }]
        })
    }
    try{
        let response= await fetch(Api_Url,RequestOption)
        let data=await response.json()
       let apiResponse=data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim()
       text.innerHTML=apiResponse    
    }
    catch(error){
        console.log(error);
        
    }
    finally{
        chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})
        image.src=`img.svg`
        image.classList.remove("choose")
        user.file={}
    }
}



function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}


function handlechatResponse(userMessage){
    user.message=userMessage
    let html=`<img src="human2.png" alt="" id="userImage" width="8%">
<div class="user-chat-area">
${user.message}
${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
</div>`
prompt.value=""
let userChatBox=createChatBox(html,"user-chat-box")
chatContainer.appendChild(userChatBox)

chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})

setTimeout(()=>{
let html=`<img src="ai.png" alt="" id="aiImage" width="10%">
    <div class="ai-chat-area">
    <img src="loading1.gif" alt="" class="load" width="50px">
    </div>`
    let aiChatBox=createChatBox(html,"ai-chat-box")
    chatContainer.appendChild(aiChatBox)
    generateResponse(aiChatBox)

},600)

}


prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
       handlechatResponse(prompt.value)

    }
})

submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value)
})
imageinput.addEventListener("change",()=>{
    const file=imageinput.files[0]
    if(!file) return
    let reader=new FileReader()
    reader.onload=(e)=>{
       let base64string=e.target.result.split(",")[1]
       user.file={
        mime_type:file.type,
        data: base64string
    }
    image.src=`data:${user.file.mime_type};base64,${user.file.data}`
    image.classList.add("choose")
    }
    
    reader.readAsDataURL(file)
})


imagebtn.addEventListener("click",()=>{
    imagebtn.querySelector("input").click()
})

function startVoiceRecognition() {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Sorry! Voice recognition is not supported in your browser. Try Chrome or Edge.");
        return;
    }

    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    
    // Basic configurations
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        console.log("Voice recognition started");
        prompt.placeholder = "Listening...";
        voiceBtn.classList.add("listening");
    }
    
    recognition.onresult = (event) => {
        console.log("Got voice result:", event.results);
        const transcript = event.results[0][0].transcript;
        prompt.value = transcript;
        voiceBtn.classList.remove("listening");
        prompt.placeholder = "Type a message...";
    }
    
    recognition.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
        voiceBtn.classList.remove("listening");
        prompt.placeholder = "Type a message...";
        alert("Voice recognition error: " + event.error);
    }
    
    recognition.onend = () => {
        console.log("Voice recognition ended");
        voiceBtn.classList.remove("listening");
        prompt.placeholder = "Type a message...";
    }
    
    try {
        recognition.start();
    } catch (err) {
        console.error("Error starting voice recognition:", err);
        alert("Error starting voice recognition. Please try again.");
    }
}

// Add event listener
voiceBtn.addEventListener("click", startVoiceRecognition);

// Add this function to check if elements are found
function checkElements() {
    console.log("Send button:", sendBtn);
    console.log("Voice button:", voiceBtn);
    console.log("Prompt input:", prompt);
}

// Add event listeners inside DOMContentLoaded to ensure HTML is loaded
document.addEventListener("DOMContentLoaded", () => {
    checkElements(); // This will help us debug

    if (voiceBtn) {
        voiceBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Voice button clicked");
            startVoiceRecognition();
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Send button clicked");
            const userMessage = prompt.value.trim();
            if (userMessage) {
                handlechatResponse(userMessage);
            }
        });
    }
});
