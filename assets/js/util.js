/*
Author: Carlo Dominguez
1/31/2023

this is for utilities
modals,forms,utilities

*/ 
//const myIp = "https://asn-jtgrp-api.onrender.com" 
//const myIp = "http://192.168.62.221:10000"

const requirements = document.querySelectorAll(".requirements")
const specialChars = "!@#$%^&*()-_=+[{]}\\| :'\",<.>/?`~"
const numbers = "0123456789"

let db = window.localStorage

let oldpwd = document.querySelector(".p1")
let nupwd = document.querySelector(".p2")

let lengBoolean, bigLetterBoolean, numBoolean, specialCharBoolean 
let leng = document.querySelector(".leng") 
let bigLetter = document.querySelector(".big-letter") 
let num = document.querySelector(".num") 
let specialChar = document.querySelector(".special-char") 

//speech synthesis
const synth = window.speechSynthesis

let xloginmodal,
	xnewsitemodal,
    xequipmenttagmodal

let voices = []

//first init delete all localstorage
//db.clear()
	
const util = {
	
	scrollsTo:(cTarget)=>{
        //asn.collapz()
		const elem = document.getElementById(cTarget)
		elem.scrollIntoView(true,{ behavior: 'smooth', block:'start', inline:'nearest' });

	},

    //=========================START VOICE SYNTHESIS ===============
    getVoice: async () => {
            
        voices = synth.getVoices()
        console.log( 'GETVOICE()')
                
        voices.every(value => {
            if(value.name.indexOf("English")>-1){
                console.log( "bingo!-->",value.name, value.lang )
                
            }
        })
        
        
    },//end func getvoice

    //speak method
    speak:(theMsg)=> {
                        
        console.log("SPEAK()")
        
        // If the speech mode is on we dont want to load
        // another speech
        if(synth.speaking) {
            //alert('Already speaking....');
            return;
        }	

        const speakText = new SpeechSynthesisUtterance(theMsg);

        // When the speaking is ended this method is fired
        speakText.onend = e => {
            //console.log('Speaking is done!');
        };
        
        // When any error occurs this method is fired
        speakText.error = e=> {
            console.error('Error occurred...');
        };

        // Checking which voices has been chosen from the selection
        // and setting the voice to the chosen voice
        
        
        voices.forEach(voice => {
            if(voice.name.indexOf("English")>-1){	
                ///// take out bring back later, 
                //console.log("speaking voice is ",voice.name)
                speakText.voice = voice
                
            }
            
        });

        // Setting the rate and pitch of the voice
        speakText.rate = 1
        speakText.pitch = 1

        // Finally calling the speech function that enables speech
        synth.speak(speakText)


    },//end func speak	
    
    //=======================END VOICE SYNTHESIS==========

    //===================== MESSENGER=================
    alertMsg:(msg,type,xmodal)=>{

        //where? login or signup modal?
        const alertPlaceholder = document.getElementById(xmodal)

        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
          `<div class="alert alert-${type} alert-dismissible" role="alert">`,
          `   <div>${msg}</div>`,
          '</div>'
        ].join('')
      
        //new osndp
        alertPlaceholder.innerHTML=""
        alertPlaceholder.append(wrapper)
    },//=======alert msg
	/*
    Toast: (msg,nTimeOut)=> {
        // Get the snackbar DIV
        var x = document.getElementById("snackbar");
        x.innerHTML=msg

        // Add the "show" class to DIV
        x.className = "show";
    
        // After 3 seconds, remove the show class from DIV
        setTimeout(function(){ 
            x.className = x.className.replace("show", "hid"); 
        }, nTimeOut);
    },
    //===============END MESSENGER ===================
    */
    
    //==============FORM FUNCS ===========
    clearBox:function(){
        let reset_input_values = document.querySelectorAll("input[type=text]") 
        for (var i = 0; i < reset_input_values.length; i++) { //minus 1 dont include submit bttn
            reset_input_values[i].value = ''
        }
    },

    //remove all form class
    resetFormClass:(frm)=>{
        const forms = document.querySelectorAll(frm)
        const form = forms[0]
    
        Array.from(form.elements).forEach((input) => {
            input.classList.remove('was-validated')
            input.classList.remove('is-valid')
            input.classList.remove('is-invalid')
        })
    },

    
    //======post check / dep slip      
    imagePost: async(url)=>{

            console.log('*** FIRING IMAGEPOST() ****')
            //upload pic of tagged euqipment
            const myInput = document.getElementsByName('uploaded_file')[0]

            //console.log('myinput', myInput.files[0])
           
            const formData = new FormData();

            formData.append('file', myInput.files[0]);     
            myInput.files[0].name ='EOEXPERIMENT.pdf'


            console.log('imagePost() myinput', myInput.files[0])

            ////console.log(formData)
            // Later, perhaps in a form 'submit' handler or the input's 'change' handler:
            await fetch(url, {
            method: 'POST',
            body: formData,
            })
            .then( (response) => {
                return response.json() // if the response is a JSON object
            })
            .then( (data) =>{
                console.log('SUCCESS')
            })
             // Handle the success response object
            .catch( (error) => {
                console.log(error) // Handle the error response object
            });


    },
    //===tagging equipment for rent/sale
    equipmentTagPost: async (frm,modal,url="",xdata={}) =>{

        console.log(xdata)
        fetch(url,{
            method:'PUT',
            //cache:'no-cache',

            headers: {
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify(xdata)
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            
            console.log('=======speaking now====', data)
            util.speak(data.voice)        

            util.hideModal('equipmentTagModal',2000)    
            
            //send message to super users
            const sendmsg = {
                msg: data.approve_voice,
                type: data.transaction     
            }

            //remind super users
            osndp.socket.emit('admin', JSON.stringify(sendmsg))

            osndp.filterBy() //reload admin.getall()
            //location.href='/admin'
        
        })
        .catch((error) => {
           // util.Toast(`Error:, ${error}`,1000)
            //console.error('Error:', error)
        })
    },

    //===== for signup posting
    signupPost:async function(frm,modal,url="",xdata={}){
        
        let continue_email = true

        fetch(url,{
            method:'POST',
            //cache:'no-cache',

            headers: {
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify(xdata)
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            //
            if(data.status){
                continue_email=true
				
				//util.speak( data.message )
				
                util.alertMsg(data.message,'success','signupPlaceHolder')
                util.alertMsg("Mailing "+util.UCase(xdata.full_name),'info','signupPlaceHolder')
                
            }else{
				
				//util.speak(data.message)
                continue_email=false
                util.alertMsg(data.message,'warning','signupPlaceHolder')
                return false
            }//eif

        })
        .finally(() => {
            if(continue_email){
				//util.speak('Emailed Successfully!')
				
                util.signupMailer(`/signupmailer/${util.UCase(xdata.full_name)}/${xdata.email}/${encodeURIComponent(window.location.origin)}`)
            }//eif
        })
        .catch((error) => {
           // util.Toast(`Error:, ${error.message}`,1000)
           console.error('Error:', error)
        })
            
    },

    //===passwordcheck
    passwordCheck:(pwd,pAlert)=>{
        
        requirements.forEach((element) => element.classList.add("wrong")) 
        
        //on focus show alter
        pwd.addEventListener('focus',(e)=>{
            pAlert.classList.remove("d-none") 
            if (!pwd.classList.contains("is-valid")) {
                pwd.classList.add("is-invalid") 
            }
            console.log('util focus')
        },false)

        //if blur, hide alert
        pwd.addEventListener("blur", () => {
            pAlert.classList.add("d-none") 
        },false) 

        //as the user types.. pls check 
        pwd.addEventListener('input',(e)=>{
            if(nupwd.value!==""){
                if(nupwd.value!==pwd.value){
                    nupwd.classList.remove("is-valid")
                    nupwd.classList.add("is-invalid")
                }
            }
            util.pwdChecker(pwd,pAlert)
            
        },false)
    
    }, //end func

    pwdChecker:(password,passwordAlert)=>{
        //check length first
        let value = password.value 
        if (value.length < 6) {
            lenBool = false 
        } else if (value.length > 5) {
            lenBool = true 
        }
        
        if (value.toLowerCase() == value) {
            bigLetterBoolean = false 
        } else {
            bigLetterBoolean = true 
        }

        numBoolean = false 
        for (let i = 0;  i < value.length ; i++) {
            for (let j = 0;  j < numbers.length ; j++) {
                if (value[i] == numbers[j]) {
                    numBoolean = true 
                }
            }
        }

        specialCharBoolean = false 
        for (let i = 0 ; i < value.length;  i++) {
            for (let j = 0 ; j < specialChars.length ; j++) {
                if (value[i] == specialChars[j]) {
                    specialCharBoolean = true 
                }
            }
        }
        //conditions
        if (lenBool == true &&
            bigLetterBoolean == true && 
            numBoolean == true && 
            specialCharBoolean == true) {

            password.classList.remove("is-invalid") 
            password.classList.add("is-valid") 

            requirements.forEach((element) => {
                element.classList.remove("wrong") 
                element.classList.add("good") 
            }) 
            passwordAlert.classList.remove("alert-warning") 
            passwordAlert.classList.add("alert-success") 
    
        } else {
            password.classList.remove("is-valid") 
            password.classList.add("is-invalid") 

            passwordAlert.classList.add("alert-warning") 
            passwordAlert.classList.remove("alert-success") 

            if (lenBool == false) {
                leng.classList.add("wrong") 
                leng.classList.remove("good") 
            } else {
                leng.classList.add("good") 
                leng.classList.remove("wrong") 
            }

            if (bigLetterBoolean == false) {
                bigLetter.classList.add("wrong") 
                bigLetter.classList.remove("good") 
            } else {
                bigLetter.classList.add("good") 
                bigLetter.classList.remove("wrong") 
            }

            if (numBoolean == false) {
                num.classList.add("wrong") 
                num.classList.remove("good") 
            } else {
                num.classList.add("good") 
                num.classList.remove("wrong") 
            }

            if (specialCharBoolean == false) {
                specialChar.classList.add("wrong") 
                specialChar.classList.remove("good") 
            } else {
                specialChar.classList.add("good") 
                specialChar.classList.remove("wrong") 
            }                        
        }//eif lengbool
    },///======end func checker

    //==========field 2 password validator
    passwordFinal:(pwd)=>{
        //on focus show alter
        pwd.addEventListener('focus',(e)=>{
            if (!pwd.classList.contains("is-valid")) {
                pwd.classList.add("is-invalid") 
            }

        },false)

        //if blur, hide alert
        pwd.addEventListener("blur", () => {
            console.log('p2 blur')
        },false) 

        pwd.addEventListener("input", () => {
            if(pwd.value == oldpwd.value){
                pwd.classList.remove("is-invalid") 
                pwd.classList.add("is-valid") 
            }else{
                if(pwd.classList.contains("is-valid")){
                    pwd.classList.remove("is-valid") 
                    pwd.classList.add("is-invalid") 
                }
            }
        },false) 

    },///// ========end password field 2 checker

    //===============END FORMS ==========//

    //====================UTILITIES ==============
    UCase:function(element){
        return element.toUpperCase()
    },
    
    //===== addto cart
	xaddtocart:()=>{
				
		//db.clear()//clear shopcart
		let cart = util.checklogin()
		
		//console.log(cart)
		
		if(cart==""||cart==null){
			util.alertMsg('Please Sign up then Login before you purchase a domain.','warning','warningPlaceHolder')    
		}else{
			
			//if all is good add to cart
			//console.log('==UY LOGGED==== ', dns_existing, searched_dns)
			
			if(dns_existing===false){
				let orders = {
					domain: searched_dns,
					amount: 10,
					email : cart.email
				}
				//===add to cart domain
				let tebingOrder = db.setItem("tebinglane-order",JSON.stringify(orders))
				//show for pay
				util.modalShow('paymentmodal')
			}//Eif
			
			//
		}
		
		console.log('hey adding to cart')
	},

	//check first if logged
	checklogin:()=>{
		let tebingUser = db.getItem("tebinglane-user")
		return JSON.parse(tebingUser)
		
	},
    
	
	setCookie : (c_name,value,exdays) => {
		//console.log('bagong setcookie');
		var exdate=new Date();
		exdate.setDate(exdate.getDate());
		var c_value = value +  "; SameSite=Lax; expires="+exdate.toISOString()+ "; path=/";
		console.log( c_name + "=" + c_value	)
		document.cookie=c_name + "=" + c_value;	
	},//eo setcookie


	getCookie : (c_name) => {
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++)
		  {
		  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		  x=x.replace(/^\s+|\s+$/g,"");
		  if (x==c_name)
			{
			return unescape(y);
			}
		  }
	},
	//==========================END UTILITIES =======================
	
    //====================== CREATE DATE/SERIAL CODE==========================
    getDate:()=>{
        var today = new Date() 
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()

        today = mm + '-' + dd + '-' + yyyy
        return today
    },
    nugetDate:()=>{
        var today = new Date() 
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()

        today = yyyy +  '-' + mm + '-' + dd
        return today
    },

    strDate:()=>{
        var today = new Date() 
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()
        var mos = new Date(`${today.getMonth()+1}/${dd}/${yyyy}`).toLocaleString('en-PH',  {month:'long'})
        today = `${mos} ${dd}, ${yyyy}`
        return today
    },

    formatDate2:(xdate)=>{
        today = new Date(xdate)
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()

        today = mm+'/'+dd+'/'+yyyy
        return today

    },

    formatDate:()=>{
        var today = new Date() 
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()

        today = yyyy+ '-' + mm + '-' + dd
        return today

    },
    
    formatNumber: (num)=> {
        const absNum = Math.abs(num);

        if (absNum >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (absNum >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toFixed(0); // Or format as needed for smaller numbers
        }
    },
    
    addCommas: (nStr)=> {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },

    Codes:()=>{
		var today = new Date() 
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()
		var hh = String( today.getHours()).padStart(2,'0')
		var mmm = String( today.getMinutes()).padStart(2,'0')
		var ss = String( today.getSeconds()).padStart(2,'0')

        today = "EO"+yyyy+mm+dd+hh+mmm+ss
        return today
	},

    //esp getting values for SELECT DROPDOWNS
    //====THIS WILL FIRE WHEN CREATING NEWSITE====//
    getAllMall:(url)=>{

        fetch(url)
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            console.log( 'All Main Malls ',data )
            cSelect = document.getElementById('mall_type')

            osndp.removeOptions( cSelect)
            console.log('line 590 util.js osndp.removeOptions()')

            let option = document.createElement("option")
            option.setAttribute('value', "")
            option.setAttribute('selected','selected')
              
            let optionText = document.createTextNode( "-- Pls Select --" )
            option.appendChild(optionText)
          
            cSelect.appendChild(option)

            for (let key in data.result) {
                let option = document.createElement("option")
                option.setAttribute('value', data.result[key].unique_id)
              
                let optionText = document.createTextNode( data.result[key].mall_name )
                option.appendChild(optionText)
              
                cSelect.appendChild(option)
            }

            cSelect.focus()
            
        })
        .catch((error) => {
            //util.Toast(`Error:, ${error}`,1000)
            console.error('Error:', error)
        })
    },
	//====================== END CREATE DATE/SERIAL CODE==========================
    

    //=======================MODALS ====================
    
    loadModals:(eModal, eModalFrm, eHashModalFrm, eModalPlaceHolder)=>{
		console.log('**** loadModals()***', eModal)
        
        //off keyboard cofig
        const configObj = { keyboard: false, backdrop:'static' }
		
        // get event
        //login event
        if(eModal == "loginModal"){
            xloginmodal =  new bootstrap.Modal(document.getElementById(eModal),configObj);
            
            let loginModalEl = document.getElementById(eModal)

            loginModalEl.addEventListener('hide.bs.modal', function (event) {
                //clear form
                let xform = document.getElementById(eModalFrm)
    
                xform.reset()
                util.resetFormClass(eHashModalFrm)
    
                //take away alert
                let cDiv = document.getElementById(eModalPlaceHolder)
                cDiv.innerHTML=""
    
                // do something...
                //console.log('LOGIN FORM EVENT -> ha?')
            },false)
            
        } //eif loginmodal

        //========for adding new site modal 
        if(eModal == "newsiteModal"){
        
            xnewsitemodal =  new bootstrap.Modal(document.getElementById(eModal),configObj);
           
                   
        
        }//eif equipmentmodal

        //equipment tag modal
        if(eModal == "equipmentTagModal"){
            //console.log('loadModals(equpmentTagModal)')
            xequipmenttagmodal =  new bootstrap.Modal(document.getElementById(eModal),configObj);
           
            //equipment 
            let equipmentTagModalEl = document.getElementById(eModal)
            
            equipmentTagModalEl.addEventListener('show.bs.modal', function (event) {
               console.log('uyyy showing ')
            },false)
            
            equipmentTagModalEl.addEventListener('hide.bs.modal', function (event) {
                 //clear form
                 let xform = document.getElementById(eModalFrm)
    
                 xform.reset()
                 util.resetFormClass(eHashModalFrm)
     
                //take away alert
                const cDiv = document.getElementById('equipmentTagPlaceHolder')
                cDiv.innerHTML=""
                
                //after posting bring back btn
                const itagsave = document.getElementById('i-tag-save')
                const btntagsave = document.getElementById('tag-save-btn')
                    
                btntagsave.disabled = false
                itagsave.classList.remove('fa-spin')
                itagsave.classList.remove('fa-refresh')
                itagsave.classList.add('fa-floppy-o')

               //// takeout muna  admin.fetchBadgeData()
                
            },false)       
        
        }//eif equipmentTagModal
        
        //================login,equipment andsignup  listener
        let aForms = [eHashModalFrm] 
        let aFormx

        // console.log(input.classList)
        if(eModal=="signupModal"){
            let passwordAlert = document.getElementById("password-alert");
        }
            
        //loop all forms
        aForms.forEach( (element) => {
            aFormx = document.querySelectorAll(element)
            //console.log(aFormx[0])
            if(aFormx){
                let aFormz = aFormx[0]
                //console.log(aFormz.innerHTML)
                Array.from(aFormz.elements).forEach((input) => {
              
                    if(!input.classList.contains('p1') &&
                        !input.classList.contains('p2')){//process only non-password field
                            input.addEventListener('keyup',(e)=>{
                                if(input.checkValidity()===false){
                                    input.classList.remove('is-valid')
                                    input.classList.add('is-invalid')
                                    e.preventDefault()
                                    e.stopPropagation()

                                } else {
                                    input.classList.remove('is-invalid')
                                    input.classList.add('is-valid')
                                } //eif
                            },false)

                            input.addEventListener('blur',(e)=>{

                                if(input.checkValidity()===false){
                                    input.classList.remove('is-valid')
                                    input.classList.add('is-invalid')
                                    e.preventDefault()
                                    e.stopPropagation()

                                } else {
                                    input.classList.remove('is-invalid')
                                    input.classList.add('is-valid')
                                } //eif
                            },false)
                    }else{ //=== if input contains pssword field
                        if(input.classList.contains('p1')){
                            if(eModal=="signupModal"){
                                util.passwordCheck(input,passwordAlert)        
                            }
                            
                        }else{
                            util.passwordFinal(input)
                        }
                        
                    }//else password field

                }) //end all get input
            }
        })///=====end loop form to get elements
    },
    
    //hide modal box
    hideModal:(cModal,nTimeOut)=>{
        setTimeout(function(){ 
            const myModalEl = document.getElementById(cModal)
            let xmodal = bootstrap.Modal.getInstance(myModalEl)
            xmodal.hide()
           
        }, nTimeOut)
    },
    //show modal box

    modalShow:(modalToShow)=>{
       
        console.log('util.modalShow() Loading... ', modalToShow)
        //off keyboard cofig
        const configObj = { keyboard: false, backdrop:'static' }
        
        switch( modalToShow ){

            case "dataEntryModal":
                const dataentrymodal =  new bootstrap.Modal(document.getElementById('dataEntryModal'),configObj);

                 dataentrymodal.show()  
                
                document.getElementById('f_transnumber').value = util.getCode()

                //asn.collapz();
            break

            case "remittanceModal":
                
                if(!asn.db.getItem('myCart')){
                    util.Toasted('Please make an Initial Entry by Opening Start Entry on the Menu!!!',3000,false)
                    util.speak('Please make an Initial Entry by Opening Start Entry on the Menu!!!')
                    return false
                }else{

                    const remitmodal =  new bootstrap.Modal(document.getElementById('remittanceModal'),configObj);
                    remitmodal.show() 

                    const dbval = JSON.parse( asn.db.getItem('myCart'))
                    const xdb = JSON.parse( asn.db.getItem('profile'))

                    //====from myCartlocal Storage
                    document.getElementById('trans_tbody').innerHTML=`<tr>
                        <td>${dbval.f_transnumber}</td>
                        <td>${dbval.f_parcel}</td>
                        <td>${dbval.login_date}</td>
                        
                        </tr>`

                    //update also form as to guide for present data
                    document.getElementById('ff_transnumber').value= dbval.f_transnumber
                    document.getElementById('x_parcel').value= dbval.f_parcel
                    document.getElementById('ff_parcel').value= dbval.f_parcel
                    document.getElementById('ff_amount').value= dbval.f_amount
                    document.getElementById('ff_empid').value= xdb.id //get emp id frm localDb
 
                }//eif

                //asn.collapz();
            break


            case "atdstatusModal":
                if(util.getCookie('grp_id')!=="2"){
                    const atdstatusmodal =  new bootstrap.Modal(document.getElementById('atdstatusModal'),configObj);
                    atdstatusmodal.show()  
   
                }else{
                    util.speak('SORRY... YOU DO NOT HAVE ACCESS FOR THIS MENU!')
                }
                
            break

            case "loginmodal":
                xloginmodal.show()    
            break
			
            case "newempModal":
            case "dataPrivacySignatureModal" :

                if(util.getCookie('grp_id')==="8"){ // HR PEOPLE FOR NOW
                    //show the dialog modal
                    //console.log('uyyy mdalshow Nu emp')
                    
                    const xmymodal =  new bootstrap.Modal(document.getElementById(modalToShow),configObj);
                    xmymodal.show()  

                }else{
                    util.speak('SORRY... YOU DO NOT HAVE ACCESS FOR THIS MENU!')
                }
            break;
        }/////===end switch
    },
    //========MODAL LISTENERS========//
    modalListeners:(eModal)=>{
        switch (eModal){

            case "claimsModal":
                //util.speak('CLAIMS MODAL SHOW!')
                //for upload pdf
                const frmclaimsupload = document.getElementById('claimsuploadForm')

                frmclaimsupload.addEventListener("submit", e => {
                    const formx = e.target;

                    xmsg = "<div><i class='fa fa-spinner fa-pulse' ></i>  Uploading CSV to Database, Please Do Not Close!!!</div>"
                    util.alertMsg( xmsg,'danger','claimsPlaceHolder')
                    util.speak('UPLOADING TO DATABASE, PLEASE DO NOT CLOSE THIS WINDOW!')
                    
                    fetch(`${myIp}/xlsclaims`, {
                        method: 'POST',
                        body: new FormData(formx),
                        })
                        .then( (response) => {
                            return response.json() // if the response is a JSON object
                        })
                        .then( (data) =>{
                            if(data.status){
                                console.log ('CLAIMS DONE!', data )
                                util.speak(data.message)
                                document.getElementById('claimsPlaceHolder').innerHTML=""
                                util.hideModal('claimsModal',2000)//then close form    
                            }

                            return true
                        })
                        // Handle the success response object
                        .catch( (error) => {
                            util.speak('ERROR IN UPLOADING DATA!')
                            console.log(error) // Handle the error response object
                            return false;
                        });

                    //e.preventDefault()
                    console.log('===claims SUBMITTTTT===')
                        //// keep this reference for event listener and getting value
                        /////const eqptdesc = document.getElementById('eqpt_description')
                        ////eqptdesc.value =  e.target.value
                    
                    // Prevent the default form submit
                    e.preventDefault();    
                })
                //=================END FORM SUBMIT==========================//
                
            break

            case "dataPrivacySignatureModal":

                util.signaturePad = null;

                console.log('SIGNATURE PAD LAUNCHED!!!!')
                    const canvas = document.getElementById('signatureCanvas');
                    const privacyModalEl = document.getElementById('dataPrivacySignatureModal');

                    // 2. Initialize SignaturePad GLOBALLY
                    // We attach it to window.util so we can access it later
                    if (canvas) {
                        util.signaturePad = new SignaturePad(canvas, {
                            //backgroundColor: 'rgb(255, 255, 255)',
                            penColor: 'rgb(0, 0, 0)',
                            throttle: 0, // Draw immediately, no lag
                            minWidth: 2,
                            maxWidth: 2
                        });
                    }

                // 3. FORCE Resize on Modal Show
                if (privacyModalEl && canvas) {
                    privacyModalEl.addEventListener('shown.bs.modal', function () {
                        console.log("======Modal Shown. Fixing Canvas...");
                        
                        // Get the actual visual size of the canvas element
                        const width = canvas.offsetWidth;
                        const height = canvas.offsetHeight;

                        // Apply it to the internal resolution
                        canvas.width = width;
                        canvas.height = height;

                        // CRITICAL: Clear the pad to reset the coordinate system
                        util.signaturePad.clear();
                        
                        // Re-enable the pad just in case
                        util.signaturePad.on();
                    });
                }

                // Call your other init functions
                if(util.toggleDriversLicenseValidation) {
                    util.toggleDriversLicenseValidation();
                }
            break;

            case "newempModal":
                
                console.log('modallisteners()=== neweempModal', eModal)
                
                const ModalEl = document.getElementById(eModal)

                //============== when new site modal loads, get project serial number
                ModalEl.addEventListener('show.bs.modal', function (event) {
                    
                    //===turn off upload-btn
                    //const btnsave = document.getElementById('mall-save-btn')
                    //btnsave.disabled = true

                    console.log('newempModal() listeners loaded')
 
                },false)

                ModalEl.addEventListener('hide.bs.modal', function (event) {
                    
                    console.log('==hiding newEmpModal .on(hide)====')
                    document.getElementById('newempPlaceHolder').innerHTML=""
                   
                    //clear form
                    let xform = document.getElementById('newempForm')
                    xform.reset()
                    util.resetFormClass('#newempForm')

                    // //after posting bring back btn
                    // const isave = document.getElementById('i-next')
                    // const btnsave = document.getElementById('newemp-next-btn')
                        
                    // btnsave.disabled = false
                    // isave.classList.remove('fa-spin')
                    // isave.classList.remove('fa-refresh')
                    // isave.classList.add('fa-arrow-right')
                    
                },false)           
            
            break

            case "commentsModal":
                const commentsModalEl = document.getElementById('commentsModal')

                commentsModalEl.addEventListener('hide.bs.modal', function (event) {
                    //clear form
                    let xform = document.getElementById('commentsForm')
                    xform.reset()
                    util.resetFormClass('#commentsForm')
                })

            break

            case "dataEntryModal":
                const dataEntryModalEl = document.getElementById('dataEntryModal')

                // dataEntryModalEl.addEventListener('show.bs.modal', function (event) {
                //     alert(util.getCode() )
                //     document.getElementById('f_transnumber').value =  util.getCode()
                // })
            
            break

        }//end sw
 
    }, //end modallisteners func =========
    //======================END MODALS====================
    //  clear form
    //  let xform = document.getElementById('commentsForm')
    //  xform.reset()
    //  util.resetFormClass('#commentsForm')
    
    getCode:() =>{

        var today = new Date()
        var dd = String(today.getDate()).padStart(2, '0')
        var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
        var yyyy = today.getFullYear()
        var hh = String( today.getHours()).padStart(2,'0')
        var mmm = String( today.getMinutes()).padStart(2,'0')
        var ss = String( today.getSeconds()).padStart(2,'0')

        today = `ASN-${yyyy}${mm}${dd}${hh}${mmm}${ss}`
        return today
    },

    //===========STRIPE PAY ===========
    paymentInsert:()=>{
		const iframer = document.getElementById( "payframe" )
		const wrapper = document.createElement('div')
		
		wrapper.innerHTML = [
			'<iframe width="100%" height="100%" border=0 class="embed-responsive-item" src="checkout2.html"></iframe>'
		].join('')
		
		iframer.append(wrapper)
		
	},

    //==============randomizer ========//
    generateRandomDigits: (n) => {
        return Math.floor(Math.random() * (9 * (Math.pow(10, n)))) + (Math.pow(10, n));
    },
      
    //===================MAILER==================
    signupMailer:async (url="")=>{
        fetch(url)
        .then((response) => {  //promise... then 
            return response.json()
        })
        .then((data) => {
            util.alertMsg(data.message,'warning','signupPlaceHolder')
            util.hideModal('signupModal',2000)
        })
        .catch((error) => {
            //util.Toast(`Error:, ${error.message}`,3000)
            console.error('Error:', error)
        })    
    },

    //==========FOR ALL THE DATA ENTRY FORM LOAD THIS FIRST TO BE ABLE TO BE VALIDATED ===//
	loadFormValidation:(eHashFrm)=>{

        console.log('===util.loadFormValidation()==', eHashFrm)
		let aForms = [eHashFrm] 
        let aFormx

		//loop all forms
		aForms.forEach( (element) => {
			aFormx = document.querySelectorAll(element)
			//console.log(aFormx[0])
			if(aFormx){
				let aFormz = aFormx[0]
				//console.log(aFormz.innerHTML)
				Array.from(aFormz.elements).forEach((input) => {
			
					if(!input.classList.contains('p1') &&
						!input.classList.contains('p2')){//process only non-password field
							input.addEventListener('keyup',(e)=>{
								if(input.checkValidity()===false){
									input.classList.remove('is-valid')
									input.classList.add('is-invalid')
									e.preventDefault()
									e.stopPropagation()

								} else {
									input.classList.remove('is-invalid')
									input.classList.add('is-valid')
								} //eif
							},false)

							input.addEventListener('blur',(e)=>{

								if(input.checkValidity()===false){
									input.classList.remove('is-valid')
									input.classList.add('is-invalid')
									e.preventDefault()
									e.stopPropagation()

								} else {
									input.classList.remove('is-invalid')
									input.classList.add('is-valid')
								} //eif
							},false)
					}else{ //=== if input contains pssword field
						if(input.classList.contains('p1')){
							if(eModal=="signupModal"){
								util.passwordCheck(input,passwordAlert)        
							}
						}else{
							util.passwordFinal(input)
						}
						
					}//else password field

				}) //end all get input
			}
		})///=====end loop form to get elements	
	},
    
    url:null,

    //for use in image/signature upload
    dataEmployeeId: null,
    dataRegion:null,
    dataEmployeeName:null,

    //=================HANDLE POSITION  CHANGE========
    checkPosition:()=>{
        util.getLocation( document.getElementById('region').value)
    },

    handlePosChange:(elem)=>{
        
        util.toggleDriversLicenseValidation()
        
        //if(document.getElementById('locStore').value==""){
        //util.getlocation( document.getElementById('region').value)
        
        //}
        util.gethub( elem )
        
    },

    getLocation : async (regionSelectElement) => {
        const selectedRegion = regionSelectElement.value;
        
        const locContainer = document.getElementById('locContainer');
        const locSelect = document.getElementById('locStore');

        // // Define which positions require a hub/store selection
        // const positionsRequiringHub = ['01', '15','17']; // Customize this

        // if (positionsRequiringHub.includes(selectedPosition)) {

        locContainer.classList.remove('d-none');
        locContainer.classList.add('d-block');

        locSelect.setAttribute('required', 'required');

        try {
            const response = await fetch(`${myIp}/getlocation/${document.getElementById('region').value}`); // Adjust this URL as needed
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const hubs = await response.json();
            const hubsArray = hubs.data

            console.log(hubs)

            locSelect.innerHTML = '<option value="">Select Location</option>';

            hubsArray.forEach(hub => {
                console.log(hub)
                const option = document.createElement('option');
                
                option.value = hub.location; //<-- value
                option.textContent = hub.location; //<-- content display 
                
                locSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error fetching hubs:', error);
            alert('Failed to load hub/store options. Please try again.');
        }

        //   // Call the utility function to fetch and populate
        
    },



    gethub : (locationSelectElement) => {
        const selectedLocation = locationSelectElement.value;
        
        const hubStoreContainer = document.getElementById('hubStoreContainer');
        const hubStoreSelect = document.getElementById('hubStore');

        // Define which positions require a hub/store selection
        const positionsRequiringHub = ['01', '15','17']; // Customize this

        if (positionsRequiringHub.includes(selectedLocation)) {

            hubStoreContainer.classList.remove('d-none');
            hubStoreContainer.classList.add('d-block');

            hubStoreSelect.setAttribute('required', 'required');

            // Call the utility function to fetch and populate
            util.fetchAndPopulateHubs();

        } else {
            hubStoreContainer.classList.remove('d-block');
            hubStoreContainer.classList.add('d-none');

            hubStoreSelect.innerHTML = '<option value="">Select Hub/Store</option>';
            hubStoreSelect.value = ''; // Reset selected value
            hubStoreSelect.removeAttribute('required');
        }
    },

    fetchAndPopulateHubs : async () => {

        const hubStoreSelect = document.getElementById('hubStore'); // Get it inside the function
        const myUrl = `${myIp}/gethub/${document.getElementById('region').value}/${document.getElementById('locStore').value}`
        console.log(myUrl)
        try {
            const response = await fetch(`${myIp}/gethub/${document.getElementById('region').value}/${document.getElementById('locStore').value}`); // Adjust this URL as needed
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const hubs = await response.json();
            const hubsArray = hubs.data

            console.log(hubs)

            hubStoreSelect.innerHTML = '<option value="">Select Hub/Store</option>';

            hubsArray.forEach(hub => {
                const option = document.createElement('option');
                
                option.value = hub.hub; //<-- value
                option.textContent = hub.hub; //<-- content display 
                
                hubStoreSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error fetching hubs:', error);
            alert('Failed to load hub/store options. Please try again.');
        }
    },
    //============toggle driver's license =====//
    toggleDriversLicenseValidation : () => {

        const jobTitleSelect = document.getElementById('jobTitle');
        const driversLicenseInput = document.getElementById('drivers_license');
        const driversLicenseHelpText = document.getElementById('drivers_license_help');
        const driversLicenseErrorDiv = document.getElementById('drivers_license-error');

        if (!jobTitleSelect || !driversLicenseInput || !driversLicenseHelpText || !driversLicenseErrorDiv) {
            console.warn("Missing elements for driver's license validation.");
            return;
        }

        const selectedJobTitle = jobTitleSelect.value;

        // Check if the job title is 'Rider' (01) or 'Transporter' (02)
        const isDriversLicenseRequired = (selectedJobTitle === '01' || selectedJobTitle === '02');

        driversLicenseInput.disabled = !isDriversLicenseRequired; // Enable if required, disable otherwise
        driversLicenseInput.required = isDriversLicenseRequired; // Set required attribute

        if (isDriversLicenseRequired) {
            driversLicenseHelpText.textContent = "Driver's License is required.";
            driversLicenseInput.classList.remove('is-valid'); // Clear previous state
            // If it becomes required and is empty, it will be marked invalid by validateMe
        } else {
            driversLicenseHelpText.textContent = "Driver's License is not required for this position.";
            driversLicenseInput.value = ''; // Clear selected file if it becomes optional
            driversLicenseInput.classList.remove('is-invalid', 'is-valid'); // Clear validation state
            driversLicenseErrorDiv.style.display = 'none'; // Hide error message
        }
    },

    //====== AUTO VALIDATE FONE NUMBER ===//
    
    autoFormatPhone:(input) => {
        let value = input.value;
        const oldSelectionStart = input.selectionStart; // Store cursor position

        // 1. Remove all non-digit characters
        let cleanedValue = value.replace(/\D/g, '');

        // 2. Limit to 11 digits (4 + 3 + 4)
        cleanedValue = cleanedValue.substring(0, 11);

        // 3. Apply the formatting (add spaces)
        let formattedValue = '';
        if (cleanedValue.length > 0) {
            formattedValue = cleanedValue.substring(0, 4); // First 4 digits
        }
        if (cleanedValue.length > 4) {
            formattedValue += ' ' + cleanedValue.substring(4, 7); // Space then next 3 digits
        }
        if (cleanedValue.length > 7) {
            formattedValue += ' ' + cleanedValue.substring(7, 11); // Space then last 4 digits
        }

        // Update the input field
        input.value = formattedValue;

        // 4. Adjust cursor position
        // This part is a bit tricky but essential for a good user experience
        let newSelectionStart = oldSelectionStart;
        const addedSpaces = (formattedValue.match(/ /g) || []).length - (value.match(/ /g) || []).length;
        if (addedSpaces > 0 && formattedValue.length > value.length && oldSelectionStart === value.length) {
            // If spaces were added at the end, move cursor with them
            newSelectionStart = formattedValue.length;
        } else if (addedSpaces > 0 && oldSelectionStart === 4) {
            // If space was added at 4th digit mark
            newSelectionStart = oldSelectionStart + 1;
        } else if (addedSpaces > 0 && oldSelectionStart === 8) {
            // If space was added at 8th digit mark
            newSelectionStart = oldSelectionStart + 1;
        } else if (addedSpaces < 0 && oldSelectionStart === 5 && value.charAt(4) === ' ' && formattedValue.charAt(4) !== ' ') {
            // If a space was deleted
            newSelectionStart = oldSelectionStart - 1;
        } else if (addedSpaces < 0 && oldSelectionStart === 9 && value.charAt(8) === ' ' && formattedValue.charAt(8) !== ' ') {
            // If a space was deleted
            newSelectionStart = oldSelectionStart - 1;
        }
        
        // Fallback: Ensure cursor is not out of bounds
        input.setSelectionRange(Math.min(newSelectionStart, formattedValue.length), Math.min(newSelectionStart, formattedValue.length));
    },

    // Your existing util.validatePhone (make sure it's available)
    validatePhone : (input)=> {
        const phonePattern = /^\d{4} \d{3} \d{4}$/; // Regex for 0917 123 4567 format
        const errorDiv = document.getElementById('phone-error');

        if (!phonePattern.test(input.value)) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            if (errorDiv) errorDiv.style.display = 'block';
            return false;
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            if (errorDiv) errorDiv.style.display = 'none';
            return true;
        }
    },
 
    //==========WHEN SUBMIT BUTTON CLICKED ==================
    validateMe: async (frmModal, frm, classX)=>{
        console.log('validateMe()===', frmModal, frm)
        
        const formElement = document.querySelector(frm) // Use querySelector for the form element
        let allFormValid = true; // Renamed to avoid confusion with aValid array

        // --- 1. Clear previous validation states and custom error messages ---
        Array.from(formElement.elements).forEach((input) => {
            input.classList.remove('is-invalid', 'is-valid');
            
            // Hide phone error
            if (input.id === 'phone' && document.getElementById('phone-error')) {
                document.getElementById('phone-error').style.display = 'none';
            }
            // Hide file input errors (only for required files)
            if (input.type === 'file' && input.hasAttribute('required')) {
                const fileErrorDiv = document.getElementById(`${input.id}-error`);
                if (fileErrorDiv) {
                    fileErrorDiv.style.display = 'none';
                }
            }
        });

        // --- 2. Perform Validation for all relevant fields ---
        Array.from(formElement.elements).forEach((input) => {
            // Only validate inputs that are part of the form and are required or have the classX
            const shouldValidate = input.classList.contains(classX) || input.hasAttribute('required');

            if (shouldValidate) {
                let inputIsValid = true; // Flag for current input's validity

                if (input.type === 'file') {
                    // Custom validation for required file inputs
                    if (input.hasAttribute('required') && input.files.length === 0) {
                        inputIsValid = false;
                        const fileErrorDiv = document.getElementById(`${input.id}-error`);
                        if (fileErrorDiv) {
                            fileErrorDiv.style.display = 'block'; // Show specific file error
                        }
                    }
                } else if (input.id === 'phone') {
                    // Custom validation for phone number (assuming it sets visual feedback)
                    inputIsValid = util.validatePhone(input); 
                } else {
                    // Standard HTML5 validation for other text/select inputs
                    inputIsValid = input.checkValidity();
                }

                // Apply Bootstrap validation classes based on inputIsValid
                if (!inputIsValid) {
                    allFormValid = false; // Mark overall form as invalid
                    input.classList.add('is-invalid');
                } else {
                    input.classList.add('is-valid');
                }
            }
        });

        // --- 3. Check if overall form is valid ---
        if (!allFormValid) {

            util.Toasted('Error, Please CHECK Your Entry, ERROR FIELDS MARKED IN RED!', 3000, false);
            console.log('Form is invalid, preventing post.');
            
            if( window.main ) { window.main.gonow = false; }
            if( window.asn ) { window.asn.gonow = false; }
            if( window.hris ) { window.hris.gonow = false; }
            
            return false;

        } else {
            // --- 4. Form is valid, prepare data for posting ---
            // For #newempForm, we use FormData directly (includes files)
            // For other forms, your existing objfrm approach remains.

            let xmsg; // Declared here for switch scope

            switch(frm){ 
                case "#dataInputForm":
                    console.log('===POSTING DATA ENTRY FORM===');    
                     // Your existing login form logic
                    let dataformData = new FormData(formElement);
                    let objForm = {};
                    
                    for (var key of dataformData.keys()) {
                        objForm[key] = dataformData.get(key);
                    }
                    
                    util.hideModal('loginModal')
                    
                    util.url = `${myIp}/bgc/saveattendance/${bgc.userId}/${bgc.belongMinistry}/${bgc.ministryId}`;

                    bgc.saveAttendance(util.url, objForm);

                    console.log('==will submit ', objForm)
                    break;
                
                break

                case '#loginForm':
                    // Your existing login form logic
                    const loginFormData = new FormData(formElement);
                    let loginObjfrm = {};
                    for (var key of loginFormData.keys()) {
                    loginObjfrm[key] = loginFormData.get(key);
                    }
                    
                    util.url = `https://lightsteelblue-chinchilla-823130.hostingersite.com/bgc/loginpost/${loginObjfrm.uid}/${loginObjfrm.pwd}`;

                    util.loginPost(frm ,frmModal,`${util.url}`);
                    break;
                
                case "#newempForm":
                    // --- THIS IS THE CRITICAL CHANGE FOR NEWEMPFORM ---
                    const formData = new FormData(formElement); // Automatically collects all text fields and files
                    formData.append('date_reg', util.getDate()); // Add date_reg to FormData
                    
                    xmsg = "<div><i class='fa fa-spinner fa-pulse' ></i> Saving to Database and Uploading Files, please wait!.</div>";
                    
                    util.alertMsg( xmsg,'danger','footer-msg'); // Changed to 'info' as it's a progress message
                    //util.Toasted( xmsg, 3000)

                    const isave = document.getElementById('i-next');

                    const btnsave = document.getElementById('newemp-next-btn');

                    if(isave && btnsave){ // Ensure elements exist
                        isave.classList.remove('fa-arrow-right');
                        isave.classList.add('fa-refresh', 'fa-spin');

                        btnsave.disabled = true;
                    }
                    
                    // Call newempPost with the FormData object
                    util.newempPost(frm, frmModal, `${myIp}/newemppost/${document.getElementById('region').value}/${document.getElementById('hireDate').value}/${document.getElementById('jobTitle').value}`, formData);
                    
                    console.log('==posting newempForm data with files ==');
                    break;

            
                case "#commentsForm":
                    console.log('===POSTING ISSUES===');
                    // Your existing comments form logic
                    break;

                case "#dataEntryForm":
                    // Your existing data entry form logic
                    const dataEntryFormData = new FormData(formElement);
                    let dataEntryObjfrm = {};
                    for (var key of dataEntryFormData.keys()) {
                    dataEntryObjfrm[key] = dataEntryFormData.get(key);
                    }
                    dataEntryObjfrm.login_date = util.nugetDate(); 
                    dataEntryObjfrm.transnumber = document.getElementById('f_transnumber').value;

                    util.toggleButton('start-btn',true);
                    
                    
                    break;

                case "#remittanceForm":
                    // Your existing remittance form logic
                    const remittanceFormElement = document.getElementById('remittanceUploadForm'); // Assuming this is still a separate form
                    let remittanceFormData = new FormData(remittanceFormElement); // Get files from here
                    
                    const remittanceTextFormData = new FormData(formElement); // Get text fields from the main form
                    let remittanceObjfrm = {};
                    for (var key of remittanceTextFormData.keys()) {
                    remittanceObjfrm[key] = remittanceTextFormData.get(key);
                    }

                    const dbval = JSON.parse( db.getItem('myCart'));
                    remittanceObjfrm.old_transnumber = dbval.f_transnumber;
                    remittanceObjfrm.old_parcel = dbval.f_parcel;
                    
                    const hubamt = parseInt( document.getElementById('f_amount').value); 
                    const remitamt =parseInt( document.getElementById('ff_amount').value);
                    
                    if( remitamt > hubamt){
                        util.Toasted('Error!!! Remitted Amount greater than Amount of Scanned Parcels!!!',3000,false);
                        window.asn.speaks('Error!!! Remitted Amount  is greater than Amount of Scanned Parcels!!!');
                        document.getElementById('f_amount').focus();
                        break;
                    }

                    // Check for file presence for remittanceUploadForm
                    let filePresent = false;
                    for (let [key, value] of remittanceFormData.entries()) {
                        if (value instanceof File && value.name !== "") {
                            filePresent = true;
                            break;
                        }
                    }

                    if (!filePresent) {
                        util.Toasted('Please select a Picture of Receipt to Upload!!!',4000,false);
                        break;
                    } else {
                        util.toggleButton('remittance-btn',true);
                        // You'll need to combine remittanceObjfrm and remittanceFormData if they go to the same endpoint
                        // or handle them in sequence. This case is still sending objfrm to savetransaction.
                        // For files in remittanceFormData, you'd need a separate endpoint for those.
                        // THIS PART IS STILL SENDING JUST OBJFRM - NEEDS CLARIFICATION FOR FILE UPLOAD HERE
                        window.asn.saveTransaction(`${myIp}/savetransaction/${util.getCookie('f_id')}`, remittanceObjfrm);
                    }
                    break;
            }
            return; // Important: ensure no implicit return true/false in this block
        }
    },

    toggleButton:(element,lshow)=>{
        let button = document.getElementById(element) //turn off remittance save btn
        button.disabled = lshow;
        button.setAttribute('aria-disabled', `${lshow}`  ); //Optional, but helps screen readers
    },

    //===calculate the distance haverstine ====//    
    getDistance:  (lat1 , lon1, lat2, lon2 ) =>{
        const R = 6371; // Earth's radius in kilometers
        const toRadians = (angle) => angle * (Math.PI / 180);

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    },


    //logout
    logOut:()=>{
        //clear items
        //db.removeItem('logged')
        // if(db.getItem('logged')){
        //     db.setItem('logged', false)
        // }
        
        location.href = './'
    },

    //=====THIS IS FOR RIDERS========//
    showPosition: async (position)=>{
        //let micasalat = '14.58063721485018'
        //let micasalon = '121.01563811625266'
       // util.speak('Checking your Position... please Wait!')
                
        let mypos = JSON.parse(db.getItem('myHub'))
                
        let distance = util.getDistance(mypos.lat, mypos.lon, position.coords.latitude, position.coords.longitude)
        let d_meters = ( distance.toFixed(3) * 1000 )
        
        console.log('==== asn.showPosition()  the distance is ',distance, d_meters)

        //override muna the meeters
        d_meters = 0.9 //DELETE LATER IF LIVE

        if( parseFloat(d_meters) <=  10){ // IF DISTANCE IS LESS OR EQ. 10METERS

            util.Toasted(`SUCCESS! YOUR DISTANCE FROM THE <BR>HUB IS ${d_meters} METER(S), PLS. WAIT!`,6000,false)
            
            //util.translate({xmsg: util.getCookie('f_voice'), cRedirect:"../jtx/dashboard"})
            location.href = '../jtx/dashboard'    
            
        }else{
            
            const errmsg =`ERROR -- PLEASE TRY AGAIN! YOUR DISTANCE FROM THE HUB  IS ${d_meters} METER(S) 
                        PLEASE GO NEARER INSIDE THE WAREHOUSE!`

            util.Toasted(`ERROR -- PLEASE TRY AGAIN! <BR>YOUR DISTANCE FROM THE HUB  IS ${d_meters} METER(S) 
                <br> PLEASE GO NEARER INSIDE THE WAREHOUSE!`,8000,false)
            
            util.speak(errmsg)
                
            document.getElementById('loginPlaceHolder').innerHTML = "" //reset alertmsg

            return 

        }
    },

    //==== for login posting
    loginPost: (frm,modal,url="") => {

        util.toggleButtonLoading("loginBtn", "Inquiring pls wait...", true);

        fetch(util.url, {
            cache:'reload'
        ,
         mode: 'cors',
  redirect: 'follow', // <--- Add this
        })
        .then((response) => {  //promise... then 
            
            return response.json();
        })

        .then((data) => {
            console.log('login here data', data, data.found)
            if (data.found || data.data) {
                const user = {
                    id: data.data[0].id,
                    full_name: data.data[0].full_name,
                    email: data.data[0].email,
                    grp_id: data.data[0].grp_id,
                    grp_description: data.data[0].grp_description,
                    ministry_id: data.data[0].ministry_id,
                    ministry_description: data.data[0].ministry_description,
                    ministry_segment: data.data[0].segment,
                };

                bgc.userId = user.id; // Set the user ID in the bgc object for global access
                bgc.belongMinistry = user.ministry_description; // Set the ministry description in the bgc object for global access
                bgc.ministryId = user.ministry_id; // Set the ministry ID in the bgc object for global access

                //save to localStorage
                localStorage.setItem('bgc_user', JSON.stringify(user));
                localStorage.setItem('token', data.token); // Save the token if needed for future authenticated requests


                // optional: check it
                console.log('saved user:', JSON.parse(localStorage.getItem('bgc_user')));
                util.toggleButtonLoading("loginBtn", null, false);

                bgc.volunteerName = user.full_name.split(' ')[0];

                util.speak( `Welcome..  ${bgc.volunteerName}!!!` );

                util.hideModal('loginModal', 100);

                const evt = new CustomEvent('userLoggedIn', {
                    detail: { data: user } // whatever you need to pass
                });
                
                document.dispatchEvent(evt);

            }else{
                util.toggleButtonLoading("loginBtn", null, false);
                util.speak('NO RECORD FOUND! PLEASE TRY AGAIN...')
                return;
            }

                
        })
        .catch((error) => {
            //util.speak(data[0].voice)

            //util.alertMsg(data[0].message,'warning','loginPlaceHolder')
            //console.log('not found',data[0].message)
            return false
        })

    },

    setGroupCookie:(xid, xregion, xname,xgrp,xemail,xvoice,xpic)=>{
        util.setCookie("f_dbId",xid,0)
        util.setCookie("f_id",xid,0)
        util.setCookie("f_region",xregion,0)
        util.setCookie("fname",xname,0)
        util.setCookie("grp_id",xgrp,0)
        util.setCookie("f_email",xemail,0)
        util.setCookie("f_voice",xvoice,0)
        util.setCookie("f_pic",xpic,0)
    },

    audio:null,

    // Usage:
    // func('my message'); // Calls with only 1 param, other_func defaults to empty function
    // Function('hey', () => { console.log('Running!'); });
    // func('my message', asn.other_func); // Calls with second param as a function
    isPlaying:false,
    
    ///=========================PLAY GREETINGS===============
    translate:async ({ xmsg, runwhat = () => {}, cRedirect } = {}) => {

        if (util.isPlaying) return; // prevent re-entry
  
        util.isPlaying = true;

        const aActs = [
            " Ingat po sa Byahe!", 
            " Galingan naten today ha?",
            " Kayang-kaya mo yan!!!!",
            " Wag pabayaan ang sarili!!!",
            " Magdasal lagi sa Panginoon!",
            " Gawin mong  sandigan ng lakas ang iyong Pamilya!"]
        
        const now = new Date();
        const hours = now.getHours(); // returns 0-23
        const wHrs = hours % 24;
        let xvoice

        if (wHrs >= 0 && wHrs < 12) { // Check for 12 AM (0)
            xvoice = `MAGANDANG UMAGA!!! ${xmsg} ${aActs[Math.floor(Math.random() * (5 - 0 + 1)) + 0]}`  
        } else if (wHrs >= 12 && wHrs <= 17) { //AM period
            xvoice =`MAGANDANG HAPON!!! ${xmsg} ${aActs[Math.floor(Math.random() * (5 - 0 + 1)) + 0]}`
        } else if (wHrs > 17 && wHrs <= 23) { //AM period
            xvoice = `MAGANDANG GABI!!! ${xmsg} ${aActs[Math.floor(Math.random() * (5 - 0 + 1)) + 0]}`
         
        }

        const apiKey = 'sk_71ec2e7034a4e78f766acbbfd418beb2d6e7c8febfc94507'; // your API key
        const voiceId = 'NEqPvTuKWuvwUMAEPBPR'; // your voice ID

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                text: xvoice ,
                model_id: 'eleven_multilingual_v2',
                output_format: 'mp3',
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const audioBlob = await response.blob();
            const url = URL.createObjectURL(audioBlob);
            const audio = new Audio(url);

            //carlo
            audio.onended = null; // Remove previous handle

            // use onended instead of addEventListener
            audio.onended = () => {
                util.isPlaying = false; // reset flag
            
                if (cRedirect !== undefined && cRedirect !== null) {
                    window.location.href = cRedirect;
                }
                if (typeof runwhat === 'function') {
                    runwhat();
                   
                }
            }//ended onended
            
            audio.play();
        } catch (error) {
        console.error('Error:', error);
            util.isPlaying = false; // Reset flag on error
        }

    },    

    //================ new employee posting =========// 
    newempPost:async function(frm,modal,url="",formData){
        fetch(url,{
            method:'POST',
            //cache:'no-cache',
            // headers: {
            //     "Content-Type": "application/json",
            // },
            
            body: formData
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            if(data.status){
                util.alertMsg( data.message,'success','footer-msg'); // Changed to 'info' as it's a progress message
                       
                //util.Toasted(data.message,3000,false)
                
                util.speak(data.voice);
               
                //hide modalbox
                util.hideModal('newempModal',0) //hide dataentry
                //document.getElementById('footer-msg').innerHTML=''//reset


                //=========SHOW DATA PRIVACY===========//
                 //==get employee Id
                util.dataEmployeeId = data.employeeId
                util.dataRegion = data.regionId
                util.dataEmployeeName = data.employeeName
               
                // --- NEW: Show the Data Privacy & Signature Modal ---
                const dataPrivacyModalElement = document.getElementById('dataPrivacySignatureModal');
                const dataPrivacyModal = new bootstrap.Modal(dataPrivacyModalElement);
                dataPrivacyModal.show();
                // Also ensure canvas is correctly sized when modal is shown
                //dataPrivacyModalElement.addEventListener('shown.bs.modal', util.resizeSignatureCanvas, { once: true });
                
            }else{
                util.speak(data.voice)
                //util.alertMsg(data.message,'warning','equipmentPlaceHolder')
                return false
            }//eif
            
            
        })
        
        .catch( (error) => {
            console.error('Error in newempPost:', error);
            util.Toasted(`Network Error: ${error.message}`, 3000, false);
        })
        .finally ( ()=>{
            const nextBtn = document.getElementById('newemp-next-btn');
            const iNext = document.getElementById('i-next');
            if(iNext && nextBtn){
                iNext.classList.remove('fa-refresh', 'fa-spin');
                iNext.classList.add('fa-arrow-right');
                nextBtn.disabled = false;
            }
        })
    },

    //=================SAVE SIGNATTURE ==========//
    saveSignature : async () =>  {

        console.log('Attempting to save signature...');
        const signatureCanvasErrorDiv = document.getElementById('signatureCanvas-error');
        const submitBtn = document.getElementById('submit-signature-btn');
        const iSave = document.getElementById('i-signature-save');

        // Clear previous error message
        if (signatureCanvasErrorDiv) signatureCanvasErrorDiv.style.display = 'none';

        // 1. Validate signature pad: Ensure something was drawn
        if (util.signaturePad && util.signaturePad.isEmpty()) {
            if (signatureCanvasErrorDiv) signatureCanvasErrorDiv.style.display = 'block';
            util.Toasted('Please provide your digital signature.', 3000, false);
            return;
        }

        // 2. Get Employee ID: This should have been set when the first modal submitted
        const employeeId = util.dataEmployeeId // Use the global variable

        if (!employeeId) {
            util.Toasted('Error: Employee ID not found. Cannot save signature.', 4000, false);
            console.error('Employee ID missing for signature save. currentEmployeeId is null.');
            return;
        }

        // Show loading indicator
        if(iSave && submitBtn){
            iSave.classList.remove('fa-check');
            iSave.classList.add('fa-refresh', 'fa-spin');
            submitBtn.disabled = true;
        }

        util.alertMsg("<div><i class='fa fa-spinner fa-pulse'></i> Uploading Signature, please wait...</div>", 'info', 'dataPrivacyPlaceHolder');

        try {
            // 3. Convert Signature from Canvas to Blob (PNG format)
            const signatureDataURL = util.signaturePad.toDataURL('image/png');

            const blob = await (await fetch(signatureDataURL)).blob();
            
            // 4. Create the desired filename: SIGN_EMP_ID.png
            // Ensure employeeId is safe for filenames
            const cleanEmployeeId = employeeId //String(employeeId).replace(/[^a-zA-Z0-9_]/g, ''); 
            const signatureFilename = `SIGN_${cleanEmployeeId}.png`;
            
            // 5. Create FormData for the signature submission
            const formData = new FormData();
            formData.append('employeeId', employeeId); // Pass employeeId to server for linking
            // Append the blob with the specific filename
            formData.append('signature_image', blob, signatureFilename); 

            // 6. ===================== Send to the new endpoint for signature upload
            const response = await fetch(`${myIp}/uploadsignature/${util.dataEmployeeId}/${util.dataRegion}`, { 
                method: 'POST',
                body: formData 
            });

            const data = await response.json(); 

            // 7. Handle the server's response
            if (data.status) {
                util.speak(data.voice);
                util.Toasted('Digital signature and privacy consent saved successfully!', 3000, true);
                util.hideModal('dataPrivacySignatureModal', 1000); 
                util.clearSignature(); 

                //====CCALL PRINT PDF
                util.printPdf(util.dataEmployeeId, util.dataEmployeeName , util.dataRegion)


            } else {
                util.speak(data.voice);
                util.Toasted(`Error: ${data.message || 'Failed to save signature.'}`, 4000, false);
            }
        } catch (error) {
            console.error('Error in saveSignature:', error);
            util.Toasted(`Network Error: ${error.message}`, 4000, false);
        } finally {
            if(iSave && submitBtn){
                iSave.classList.remove('fa-refresh', 'fa-spin');
                iSave.classList.add('fa-check');
                submitBtn.disabled = false;
            }
        }
    },

    //==============CALL PRINT TO PDF
    printPdf: async ( empid, empname, empregion )=> {

        let xfile = `${empid}.pdf`
         
        fetch(`${myIp}/printpdf/${empid}/${ empname}/${ empregion}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                
                //body: JSON.stringify({ myObjects: asn.pdfCart }), // Convert the array to JSON
                //cache: 'reload' // Remove if you don't need to reload
            })
            .then(response => response.blob())
            .then(blob => URL.createObjectURL(blob))
            .then(url => {
                const a = document.createElement('a');
                a.href = url;
                a.download =  xfile ;//`${pdffile}`; // Set the file name for the download
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch((error) => {
                //util.Toast(`Error:, ${error}`,1000)
                alert(error)
                console.error('Error:', error)
            })
    },

    resizeSignatureCanvas : () => {
        const canvas = document.getElementById('signatureCanvas');
        if (canvas && util.signaturePad) {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            util.signaturePad.clear(); // Clear previous drawing after resize
        }
    },

    clearSignature : () => {
        if (util.signaturePad) {
            util.signaturePad.clear();
            document.getElementById('signatureCanvas-error').style.display = 'none'; 
        }
    },
    



    //utility toastify
    Toasted:async(msg,nDuration,lClose)=>{
        Toastify({
            text: msg ,
            duration: nDuration,
            escapeMarkup: false, //to create html
            close: lClose,
            position:'center',
            offset:{
                x: 0,
                y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
            },
            style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
        
    }, //===end toasted!

    checkFileSize: (elem, fsize) => {
        const input = elem;
        if (!input || !input.files || input.files.length === 0) return true;

        const MAX_KB = fsize; // 1000 KB ~= 1 MB
        //const btnUpload = document.getElementById('mall-save-btn');

        let recosize, sizesuffix

        for (let i = 0; i < input.files.length; i++) {
            const kb = Math.round(input.files[i].size / 1024);
            if (kb >= MAX_KB) {
                //if (btnUpload) btnUpload.disabled = true;
                    util.alertMsg("File too Big, please select a file less than 800kb", "danger", "size");
                    input.value = ''; // reset selection
                    //util.scrollsTo('blindspot');
                    return false;
            }
        }

        //if (btnUpload) btnUpload.disabled = false;
        return true;
    },
    /**
     * Toggle loading state on a button.
     * @param {string} buttonId  - The element ID of the button.
     * @param {string} [label]   - Optional new label while loading (e.g., "Saving...").
     * @param {boolean} toggle   - true = show spinner, false = restore original.
     * usage
     * // Turn ON loading: spinner + label "Saving..."
        toggleButtonLoading("btnConfirmDeactivate", "Saving...", true);

        // Turn OFF loading: restore original icon + text
        toggleButtonLoading("btnConfirmDeactivate", null, false);
            * 
     */
    
    toggleButtonLoading: (buttonId, label, toggle) => {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        if (toggle) {
            // Save original content only once
            if (!btn.dataset.originalHtml) {
            btn.dataset.originalHtml = btn.innerHTML;
            }
            btn.disabled = true;

            const loadingLabel = label || btn.textContent.trim() || "Loading...";

            // Bootstrap spinner example; change classes as needed
            btn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            ${loadingLabel}
            `;
        } else {
            // Restore original content
            if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
            }
            btn.disabled = false;
        }
    }

    
}//****** end obj */

window.util = util; // Make util globally accessible