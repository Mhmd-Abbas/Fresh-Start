import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, collection, getDocs,
         getDoc, addDoc, query, where, and, or, onSnapshot,
          doc, serverTimestamp, deleteDoc, updateDoc,
          orderBy, limit, Timestamp
        } from "firebase/firestore";
import { v4 } from "uuid";

// tools initialization
const app = initializeApp(firebaseConfig)
const db = getFirestore()
const storage = getStorage(app);


// get users colloctions
const adminRef = collection(db, 'Admin')
const userRef = collection(db, 'users')
const companyRef = collection(db, 'companies')

// get web data colloctions
const postRef = collection(db,'posts')
const chatRef = collection(db, 'chats')
const commentRef = collection(db, 'comments')
const followerRef = collection(db, 'followers')
const likesRef = collection(db, 'likes')
const messageRef = collection(db, 'messages')
const partRef = collection(db, 'parts')
const formsRef = collection(db, 'forms')
const feedbackRef = collection(db, 'feedback')

//all users collections
const admins = []
let users = []
const companies = []


// JS function to create elements
function createPosts(html){
  const temp = document.createElement("template");

  temp.innerHTML = html.trim();

  return temp.content.firstElementChild;    
}

// JS function to copy URL
const copyText = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => console.log("Copied: " + text))
    .catch(err => console.error("Error copying: ", err));
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

// Login  ///////////////////////////////////////////////////////////////////////

const Login = document.querySelector('.login-form')

if(Login){

  let user_found = false

  getDocs(userRef)
  .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        users.push({...doc.data(), id: doc.id})
      })
  })
  .catch(err => {
    console.log(err.message)
  })

  getDocs(companyRef)
  .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        companies.push({...doc.data(), id: doc.id})
      })
  })
  .catch(err => {
    console.log(err.message)
  })

  getDocs(adminRef)
  .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        admins.push({...doc.data(), id: doc.id})
      })
  })
  .catch(err => {
    console.log(err.message)
  })

  Login.addEventListener('submit', (e) => {
    e.preventDefault()

    if(Login.email.value != "" && Login.password.value){
      
    const useremail = Login.email.value
    const userpass = Login.password.value
  
    users.forEach( (e) => {
      if(e.email == useremail && e.password == userpass){

        const map = new Map(Object.entries(e.Interests));
        const arr = []

        for(let i=0; i<3; i++){
          let likes = 0
          let tag = ""
          for(let [key,val] of map){
            if(val >=  likes && val != 0){
              likes = val
              tag = key
            }
          }
          if(likes != 0){
            map.set(`${tag}`, 0)
            arr.push(tag)
            arr.push(likes)
          }
        }

        Login.reset();
        localStorage.clear()
        localStorage.setItem("userID", e.id)
        localStorage.setItem("email", e.email)
        localStorage.setItem("firstName", e.first_name)
        localStorage.setItem("lastName", e.last_name)
        localStorage.setItem("displayName", e.display_name)
        localStorage.setItem("profile_pic", e.profile_pic)
        localStorage.setItem("description", e.description)
        localStorage.setItem("most_liked", arr)
        localStorage.setItem("account_type", e.account_type)
        user_found = true
        location.href = "community-2.html"
      }
    })

    companies.forEach( (e) => {
      if(e.email == useremail && e.password == userpass){
        Login.reset();
        localStorage.clear()
        localStorage.setItem("userID",e.id)
        localStorage.setItem("email", e.email)
        localStorage.setItem("firstName", "")
        localStorage.setItem("lastName", "")
        localStorage.setItem("displayName", e.name + " - " + e.location)
        localStorage.setItem("profile_pic", e.profile_pic)
        localStorage.setItem("description", e.description)
        localStorage.setItem("account_type", e.account_type)
        user_found = true
        location.href = "community-2.html"
      }
    })

    admins.forEach( (e) => {
      if(e.email == useremail && e.password == userpass){
        Login.reset();
        localStorage.clear()
        localStorage.setItem("userID", e.id)
        localStorage.setItem("email", e.email)
        localStorage.setItem("firstName", e.first_name)
        localStorage.setItem("lastName", e.last_name)
        localStorage.setItem("displayName", e.display_name)
        localStorage.setItem("profile_pic", e.profile_pic)
        localStorage.setItem("description", e.description)
        localStorage.setItem("account_type", e.account_type)
        user_found = true
        location.href = "community-2.html"
      }
    })

    if(user_found != true){
      alert("incorrect Email or Password")
    }
  }
  })
}

//////////////////////////////////////////////////////////////////////////////


// Sign up ///////////////////////////////////////////////////////////////////

const Signup_retired = document.querySelector(".SignUp-retired")
const Signup_company = document.querySelector(".SignUp-company")


const checkedInterests = new Map()
checkedInterests.set("Travel" , 0)
checkedInterests.set("Food" , 0)
checkedInterests.set("Tech" , 0)
checkedInterests.set("Health" , 0)
checkedInterests.set("Business" , 0)
checkedInterests.set("Lifestyle" , 0)
checkedInterests.set("Art" , 0)
checkedInterests.set("News" , 0)
checkedInterests.set("Gradening" , 0)
checkedInterests.set("Pets" , 0)
checkedInterests.set("Professions" , 0)

if(Signup_retired){ 

  getDocs(userRef)
  .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        users.push({...doc.data(), id: doc.id})
      })
  })
  .catch(err => {
    console.log(err.message)
  })

  getDocs(companyRef)
  .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        companies.push({...doc.data(), id: doc.id})
      })
  })
  .catch(err => {
    console.log(err.message)
  })

  Signup_retired.addEventListener('submit', (e) => {
    e.preventDefault()
    document.getElementById("wait").style.display ="block"

    
    const arr = Array.prototype.slice.call(Signup_retired.children[25].children);

    console.log(arr)

    arr.forEach( (e) =>{
      if(e.children[0].checked){
        checkedInterests.set(`${e.children[0].value}`, 25)
      }
    })

    console.log(checkedInterests)

    const obj = Object.fromEntries(checkedInterests);

    console.log(obj)
    let exists = false
    
    users.forEach( (e) => {
      if(Signup_retired.email.value == e.email ||  Signup_retired.displayName.value == e.display_name){
        exists = true
      }
    })

    companies.forEach( (e) => {
      if(Signup_retired.email.value == e.email ||  Signup_retired.displayName.value == e.display_name){
        exists = true
      }
    })

    if(exists == false){
    addDoc(userRef, {
      first_name: Signup_retired.firstName.value,
      last_name: Signup_retired.lastName.value,
      display_name: Signup_retired.displayName.value,
      age: Signup_retired.age.value,
      gender: Signup_retired.gender.value,
      email: Signup_retired.email.value,
      password: Signup_retired.password.value,
      profile_pic:"./image/defualt-profile.jpeg",
      description: "...",
      Interests: obj,
      account_type: "normal"
    })
    .then(() => {
      document.getElementById("wait").style.display ="none"
      document.getElementById("success").style.display ="block"
      Signup_retired.reset();
      location.href = "login.html"

    })
  }
  else{
      document.getElementById("wait").style.display ="none"
      document.getElementById("fail").style.display ="block"
      document.getElementById("fail").innerHTML =`
        <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
        Email already exists`
  }
  })
}

if(Signup_company){

  getDocs(userRef)
  .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        users.push({...doc.data(), id: doc.id})
      })
  })
  .catch(err => {
    console.log(err.message)
  })

  getDocs(companyRef)
  .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        companies.push({...doc.data(), id: doc.id})
      })
  })
  .catch(err => {
    console.log(err.message)
  })

  Signup_company.addEventListener('submit', (e) => {
    e.preventDefault()

    let exists = false

    users.forEach( (e) => {
      if(Signup_company.email.value == e.email ){
        exists = true
        console.log(Signup_company.email.value)
        console.log(e.email)
      }
    })

    companies.forEach( (e) => {
      if(Signup_company.email.value == e.email ){
        exists = true
        console.log(Signup_company.email.value)
        console.log(e.email)
      }
    })

    document.getElementById("wait").style.display ="block"

    if(exists == false){
    addDoc(companyRef, {
      name: Signup_company.companyName.value,
      industry: Signup_company.industry.value,
      location: Signup_company.location.value,
      email: Signup_company.email.value,
      password: Signup_company.password.value,
      profile_pic: "./image/defualt-profile.jpeg",
      description: "...",
      account_type: "company"
    })
    .then(() => {
      document.getElementById("wait").style.display ="none"
      document.getElementById("success").style.display ="block"
      Signup_company.reset();
      location.href = "login.html"
    })
    }
    else{
      document.getElementById("wait").style.display ="none"
      document.getElementById("fail").style.display ="block"
      document.getElementById("fail").innerHTML =`
        <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
        Email already exists`
    }
  })
}
// profile pics ////////////////////////////////////////////////////////////////////////////

const profile_pic = document.querySelector(".profile-pic")
const profile_picc = document.querySelector(".profile-picc")
const profile_pic_large = document.querySelector(".profile-pic-large")
const profile_header = document.querySelector(".profile-header")
const user_info = document.querySelector(".user-info")

if(profile_pic){
  profile_pic.src = localStorage.getItem("profile_pic")
  profile_pic_large.src = localStorage.getItem("profile_pic") 
  profile_header.children[1].innerHTML = localStorage.getItem("displayName")
}
if(profile_picc){
  let l = localStorage.getItem("profile_pic")
  if(document.getElementById("AI-page") && l.length < 30 ){
    profile_picc.src = `.${localStorage.getItem("profile_pic")}`
  }
  else{
    profile_picc.src = localStorage.getItem("profile_pic") 
  }
  profile_pic_large.src = localStorage.getItem("profile_pic") 
  profile_header.children[1].innerHTML = localStorage.getItem("displayName") 
}

if(user_info){
  user_info.children[0].children[0].src = localStorage.getItem("profile_pic")
}




// User Profile //////////////////////////////////////////////////////////////

const profile_page = document.getElementById("profile_page")
const blurr = document.querySelector(".blurr")


if(profile_page){
  const username = document.querySelector(".username")
  const name = document.querySelector(".profile-name")
  const pic = document.querySelector(".profile-pic")
  const f1 = document.querySelector(".followers")
  const f2 = document.querySelector(".following")
  const description = document.querySelector(".description")

  if(username){

    if(!localStorage.getItem("userID")){
      blurr.style.display = "block"
      const text = "you are currently in guest mode if you want to check the website features please log in"
      if (confirm(text) == true) {
        location.href = "login.html"
      } 
    }

    username.innerHTML = "@" + localStorage.getItem("displayName")
    name.innerHTML = localStorage.getItem("firstName") + " " + localStorage.getItem("lastName")
    pic.src = localStorage.getItem("profile_pic")
    description.innerHTML = localStorage.getItem("description")

}

} 


//////////////////////////////////////////////////////////////////////////////


// Making a post  ////////////////////////////////////////////////////////////

const make_post = document.querySelector(".add-button")
const make_post_tab = document.querySelector(".make_post_tab")
const post_desc = document.querySelector(".post_desc")
const post_img = document.querySelector(".post_img")
const post_vid = document.querySelector(".post_vid")
const img_input = document.querySelector(".img_input")
const tag_input = document.querySelector(".tag-value")
const Page_input =document.querySelector(".page-value")
const Page_value = document.querySelector(".page-value")

const post_btn = document.querySelector(".post_btn")
const post_cancel = document.querySelector(".post_cancel")

let video = false
let textonly = true

if(make_post){
  make_post.addEventListener("click", (e) => {

    blurr.style.display = "block"
    make_post_tab.style.display = "block"
    textonly = true
    video = false
  })
}

if(img_input){
  img_input.addEventListener("input",function() {
    textonly = false
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      if(this.files[0].type == "video/mp4"){
        post_vid.src = reader.result
        post_img.style.display = "none"
        post_vid.style.display = "block"
        video = true
      }
      else{
        post_img.src = reader.result
        post_vid.style.display = "none"
        post_img.style.display = "block"
        video = false
      }
      
    })
    reader.readAsDataURL(this.files[0])
  })
}

if(post_btn){
  post_btn.addEventListener("click", (e) => {
    e.preventDefault()
    if(post_desc.value != "" ){
      document.getElementById("wait").style.display ="block"

      const file = img_input.files[0]
      const mediaRef = ref(storage, `media/${ v4() }`);
      let mediaURL = ""

      uploadBytes(mediaRef, file)
      .then( () => {
        console.log("image uploaded")
        getDownloadURL(mediaRef).then( (url) =>{
          mediaURL = url

      console.log(Page_input.value)
    
      addDoc(postRef,{
        user_id: localStorage.getItem("userID"),
        user_display_name: localStorage.getItem("displayName"),
        profile_pic: localStorage.getItem("profile_pic"),
        description: post_desc.value, 
        likes: ["0"],
        media: `${mediaURL}`,
        video: video,
        textonly: textonly,
        createdAT: serverTimestamp(),
        createdAT2: `${Timestamp.now().toDate().getDate()}/${ months[Timestamp.now().toDate().getMonth()]}`,
        type: Page_input.value,
        tag: tag_input.value

      })
      .then(() => {
  
        post_desc.value = ""
        post_vid.src = ""
        post_img.src = " "
        img_input.value = ""
        blurr.style.display = "none"
        make_post_tab.style.display = "none"
        tag_input.value = "none"
        document.getElementById("wait").style.display ="none"
        document.getElementById("success").style.display ="block"
      })
      .catch(() => {
        document.getElementById("wait").style.display ="none"
        document.getElementById("fail").style.display ="block"
      })
    })
    })
    }
    else{document.getElementById("fail2").style.display ="block"}
  })
}

if(post_cancel){
  post_cancel.addEventListener("click", (e) => {
    post_desc.value = ""
    post_img.src = " "
    img_input.value = ""
    blurr.style.display = "none"
    make_post_tab.style.display = "none"
  })
}

if(make_post_tab){

  if(localStorage.getItem("account_type") == "normal"){
    Page_value.innerHTML = `
          <option value="community">Community</option>
          <option value="volunteer">Volunteer</option>
    `
  }
  else{
    Page_value.innerHTML = `
    <option value="work">work</option>
    <option value="volunteer">Volunteer</option>
`
  }

}

//////////////////////////////////////////////////////////////////////////////



// displaying posts in community page //////////////////////////////////////////////////////////

const community_page_id = document.querySelector(".community-section2")
const share_page = document.getElementById("share-page")

const comment_tab = document.querySelector(".make_comment_tab")
const comment_text2 = document.querySelector(".comment_text2")
const make_comment_btn = document.querySelector(".make_comment_btn")
const make_comment_cancel = document.querySelector(".make_comment_cancel")
const loading = document.querySelector(".loading")

const filter = document.querySelector(".filter")
const filter_input = document.querySelector(".filter_input")
const filter_btn = document.querySelector(".filter_btn")

let post_id_comment = ""



if(community_page_id && !share_page) {

  let most_liked = localStorage.getItem("most_liked")? localStorage.getItem("most_liked").toLowerCase().split(",") : ["0","0","0","0","0","0"]
  
  const q = query(postRef, where("type", "==", "community"), orderBy("createdAT", "desc"))
  const q2 = query(postRef, and(where("type", "==", "community"), where("tag", "in", most_liked)), orderBy("createdAT", "desc")  )
  const q3 = query(postRef, and(where("type", "==", "community"), where("tag", "not-in", most_liked)), orderBy("createdAT", "desc")  )

  
  let posts = []

  if(filter_btn){
    filter_btn.addEventListener("click", () => {

      if(filter.value == "Username" && filter_input.value != ""){
        const userq = query(postRef, and(where("type", "==", "community"), where("user_display_name", ">=", `${filter_input.value}`), where("user_display_name", "<=", `${filter_input.value}` + "\uf8ff")), orderBy("createdAT", "desc")  ) 
       console.log("Looking for user")
       loading.style.display = "block"

        getDocs(userq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
    
          
          loading.style.display = "none"
          community_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                      <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
              `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>

                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>

                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".community-section2").appendChild(community_posts);
          })
    
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
         })
        .catch(err => {
        console.log(err.message)
        })

      }
      else if(filter.value == "Description" && filter_input.value != ""){
        const filterValue = filter_input.value.toLowerCase().trim()
        filter_input.value = filterValue
        const descq = query(postRef, and(where("type", "==", "community"), where("description", ">=", `${filter_input.value}`), where("description", "<=", `${filter_input.value}` + "\uf8ff")), orderBy("createdAT", "desc")  ) 

        console.log("looking for desc")
       loading.style.display = "block"

        getDocs(descq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          community_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
              `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".community-section2").appendChild(community_posts);
          })
    
          //1
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
         })
        .catch(err => {
        console.log(err.message)
        })


      }
      else if(filter.value == "Tag" && filter_input.value != ""){
        const filterValue = filter_input.value.toLowerCase().trim()
        filter_input.value = filterValue
        const tagq = query(postRef, and(where("type", "==", "community"), where("tag", ">=", `${filter_input.value}`), where("tag", "<=", `${filter_input.value}` + "\uf8ff")),orderBy("createdAT", "desc")  ) 

        console.log("looking for tag")
        loading.style.display = "block"

        getDocs(tagq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          community_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
              `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".community-section2").appendChild(community_posts);
          })
    
          //1
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
         })
        .catch(err => {
        console.log(err.message)
        })


      }
      else if(filter.value == "Recommended"){

        loading.style.display = "block"

        if(most_liked[1] == "0" && most_liked[3] == "0" && most_liked[5] == "0"){
          getDocs(q)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
            
            loading.style.display = "none"
            community_page_id.innerHTML = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".community-section2").appendChild(community_posts);
            })
      
            //1
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);

            const sharecollection = document.querySelectorAll("#share-btn")
            const arr7 = Array.prototype.slice.call(sharecollection);
      
            arr7.forEach( (elmnt) => {
      
              elmnt.addEventListener("click", () => {
      
                copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
                alert("link copied")
              })
      
            })
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
      
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
           })
        
        }
        else{
          getDocs(q2)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
      
            
            loading.style.display = "none"
            community_page_id.innerHTML = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".community-section2").appendChild(community_posts);
            })
      
           })
      
          getDocs(q3)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
      
            community_page_id.innerHTM = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".community-section2").appendChild(community_posts);
            })
      
            //1
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);

                  const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
          alert("link copied")
        })

      })
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
      
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_text2.value = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
           })
          .catch(err => {
          console.log(err.message)
          })
      
        }
        
      }
      else if(filter.value == "Date"){

        const dateq = query(postRef, where("type", "==", "community"), orderBy("createdAT", "desc")  ) 

        loading.style.display = "block"

        getDocs(dateq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          community_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".community-section2").appendChild(community_posts);
          })
    
          
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
         })
        .catch(err => {
        console.log(err.message)
        })


      }

    })
  }


  if(most_liked[1] == "0" && most_liked[3] == "0" && most_liked[5] == "0"){

    getDocs(q)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      document.querySelector(".main2").style.display = "none"
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
              ${e.textonly? 
                `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".community-section2").appendChild(community_posts);
      })


      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const profilecollection = document.querySelectorAll(".user_profile_pic")
      const arr6 = Array.prototype.slice.call(profilecollection);

      const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`${elmnt.children[0].id}`)
          alert("link copied")
          console.log("link copied")
        })

      })

      arr6.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {

          localStorage.setItem("other_user", `${elmnt.id}`)
          location.href = "Profile2.html"
        })

      })
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })

     })
    .catch(err => {
    console.log(err.message)
    })
  
  }
  else{
    getDocs(q2)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      document.querySelector(".main2").style.display = "none"
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
              ${e.textonly? 
                `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".community-section2").appendChild(community_posts);
      })


      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const profilecollection = document.querySelectorAll(".user_profile_pic")
      const arr6 = Array.prototype.slice.call(profilecollection);

      arr6.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {

          localStorage.setItem("other_user", `${elmnt.id}`)
          location.href = "Profile2.html"
        })

      })
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })

     })
    .catch(err => {
    console.log(err.message)
    })

    getDocs(q3)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      document.querySelector(".main2").style.display = "none"
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
              ${e.textonly? 
                `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".community-section2").appendChild(community_posts);
      })


      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const profilecollection = document.querySelectorAll(".user_profile_pic")
      const arr6 = Array.prototype.slice.call(profilecollection);

      const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
          alert("link copied")
        })

      })

      arr6.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {

          localStorage.setItem("other_user", `${elmnt.id}`)
          location.href = "Profile2.html"
        })

      })
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })

     })
    .catch(err => {
    console.log(err.message)
    })

  }

}

//////////////////////////////////////////////////////////////////////////////


// displaying posts in profile page////////////////////////////////////////////

const profile_page_id = document.getElementById("profile_page")
const postsN = document.querySelector(".posts")

const delete_tab = document.querySelector(".delete_tab")
const delete_btn = document.querySelector(".delete_btn")
const delete_cancel = document.querySelector(".delete_cancel")

const edit_tab = document.querySelector(".edit_post_tab")
const edit_btn = document.querySelector(".edit_btn")
const edit_cancel = document.querySelector(".edit_cancel")
const edit_media = document.getElementById("edit_media")
const edit_description = document.getElementById("edit_description")

const edit_button = document.querySelector(".edit-button")
const edit_profile_tab = document.querySelector(".edit_profile_tab")
const edit_profile_desc = document.querySelector(".edit_profile_desc")
const edit_profile_media = document.getElementById("edit_profile_media")
const profile_img_input = document.getElementById("profile_img_input")
const edit_profile_btn = document.querySelector(".edit_profile_btn")
const edit_profile_cancel = document.querySelector(".edit_profile_cancel")


if(profile_page_id) {

  document.querySelector(".profile-page").id = localStorage.getItem("userID")

  const profile_page_q = query(postRef, where("user_id", "==", localStorage.getItem("userID")), orderBy("createdAT", "desc") )

  onSnapshot(profile_page_q, (snapshot) => {
    let profile_posts = []
    snapshot.docs.forEach( (doc) => {
      profile_posts.push({...doc.data(), id:doc.id})
    })


    console.log("......")
    postsN.childNodes[0].data = `${profile_posts.length}`
    document.getElementById("main").innerHTML = "";

    let profile_posts2 = null

    profile_posts.forEach( (e) => {

      if(e.profile_pic != localStorage.getItem("profile_pic")){
        const docRef = doc(db, "posts", e.id)
        updateDoc(docRef, {
          profile_pic: `${localStorage.getItem("profile_pic")}`
        })
      }

      profile_posts2 = createPosts(`
          <div class="postcard" id=${e.id} >
            <div class="user-name">
              <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                    <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
            </div>  
            ${e.textonly? 
              `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
            <div class="reacts">
              <button id=${e.id} class="edit">
                <img width="20px" height="20px" src="./image/edit.svg" alt="comment "/>Edit
              </button>
              <button id=${e.id} class="delete" src="${e.media}" >
                <img width="20px" height="20px" src="./image/delete.svg" alt="share"/>Delete
              </button>
            </div>
          </div>
      `);
      document.getElementById("main").appendChild(profile_posts2);
    })

    const htmlcollection = document.getElementsByClassName("delete")
    const arr = Array.prototype.slice.call(htmlcollection);
  
    arr.forEach((elmnt) => {
      elmnt.addEventListener("click", () => {

        blurr.style.display = "block"
        delete_tab.style.display = "block"

        delete_btn.id = elmnt.id

        })
    })

    const htmlcollection2 = document.getElementsByClassName("edit")
    const arr2 = Array.prototype.slice.call(htmlcollection2);
  

    arr2.forEach((elmnt) => {
      elmnt.addEventListener("click", () => {

        blurr.style.display = "block"
        edit_tab.style.display = "block"
        edit_description.value = document.getElementById(elmnt.id).children[1].innerHTML
        edit_media.src = document.getElementById(elmnt.id).children[2].src

        edit_btn.id = elmnt.id

        })
    })

    const htmlcollection3 = document.querySelectorAll(".post_media")
    const arr3 = Array.prototype.slice.call(htmlcollection3);

    arr3.forEach( (post) => {
      post.addEventListener("click", () => {

        const q = doc(db, "posts", post.id) 
        const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
        const bigger_post = document.querySelector(".main3")
        const bigger_post_no_comments = document.getElementById("no_comments2")
        const bigger_post_comments = document.getElementById("comments2")
        const close_btn = document.querySelector(".close_btn")
        let allcomments = []

        if(close_btn){
          close_btn.addEventListener("click", () => {
            bigger_post.style.display = "none"

            bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
            bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
            bigger_post.children[0].children[1].innerHTML = "..."
            bigger_post.children[0].children[2].src = "./image/loading.gif"
            bigger_post.children[0].children[3].src = "./image/loading.gif"
            bigger_post.children[0].children[2].style.display = "block"
            bigger_post.children[0].children[3].style.display = "none"

            bigger_post_comments.innerHTML = `
              <div class="no_comments" id="no_comments2" >
                <h2>No comments</h2>
              </div>
            `
          })
        }

        bigger_post.style.display = "flex block"
        getDoc(q)
          .then( (post2) => {
            if(post2.data().video){
              bigger_post.children[0].children[2].style.display = "none"
              bigger_post.children[0].children[3].style.display = "block"
              bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
              bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
              bigger_post.children[0].children[1].innerHTML = post2.data().description
              bigger_post.children[0].children[3].src = post2.data().media
            }
            else{
              bigger_post.children[0].children[3].style.display = "none"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
              bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
              bigger_post.children[0].children[1].innerHTML = post2.data().description
              bigger_post.children[0].children[2].src = post2.data().media
            }
          })
          getDocs(q2)
            .then( (snapshot) => {
              snapshot.docs.forEach((doc) => {
                allcomments.push({...doc.data(), id: doc.id})
              })

              let commentElmnt = null

              if(allcomments.length != 0){
                bigger_post_no_comments.style.display = "none"
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display:'flex block';" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name3"> ${comment.username} </p>
                      <p class="comment_text3"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  bigger_post_comments.appendChild(commentElmnt);
              })          
            }

            })
        
      })
    })


  })


  //Deleting posts//////////////////////////////////////////////////////////////
  if(delete_cancel){
    delete_cancel.addEventListener("click", (e) => {

      blurr.style.display = "none"
      delete_tab.style.display = "none"

    })
  }

  if(delete_btn){
    delete_btn.addEventListener("click", (e) => {

      const deletePostRef = doc(db, 'posts', delete_btn.id)


      let oldmediaURL = ref(storage, document.getElementById(`${delete_btn.id}`).children[2].src)
      console.log(oldmediaURL)

      deleteDoc(deletePostRef)
      .then( () => {
        blurr.style.display = "none"
        delete_tab.style.display = "none"
      })
      .catch(() => {
        document.getElementById("wait").style.display ="none"
        document.getElementById("fail").style.display ="block"
      })

      deleteObject(oldmediaURL).then( () => {
        console.log("media deleted")
        oldmediaURL = ""
      })
      .catch( () => {
        console.log("delete error")
      })
    })

  }
  //////////////////////////////////////////////////////////////////////////////


  //Editing posts///////////////////////////////////////////////////////////////
  if(edit_cancel){
    edit_cancel.addEventListener("click", (e) => {

      blurr.style.display = "none"
      edit_tab.style.display = "none"

    })
  }

  if(edit_btn){
    edit_btn.addEventListener("click", (e) => {

      const updatePostRef = doc(db, "posts", edit_btn.id)
      document.getElementById("wait").style.display ="block"

      updateDoc(updatePostRef , {
        description: edit_description.value
      })
      .then( () => {
        blurr.style.display = "none"
        edit_tab.style.display = "none"
        document.getElementById("wait").style.display ="none"
        document.getElementById("success").style.display ="block"
      })
      .catch(() => {
        document.getElementById("wait").style.display ="none"
        document.getElementById("fail").style.display ="block"
      })
    })
  }
  //////////////////////////////////////////////////////////////////////////////


  //Editing profile/////////////////////////////////////////////////////////////


  if(profile_img_input){
    profile_img_input.addEventListener("input",function() {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        edit_profile_media.src = reader.result
      })
      reader.readAsDataURL(this.files[0])
    })
  }

  if(edit_button){
    edit_button.addEventListener("click", (e) => {

      blurr.style.display = "block"
      edit_profile_tab.style.display = "block"

      edit_profile_media.src = localStorage.getItem("profile_pic")
      edit_profile_desc.value = localStorage.getItem("description")
      profile_img_input.value = ""

    })
  }

  if(edit_profile_cancel){
    edit_profile_cancel.addEventListener("click", (e) => {

      blurr.style.display = "none"
      edit_profile_tab.style.display = "none"

    })
  }

  if(edit_profile_btn){
    edit_profile_btn.addEventListener("click", (e) => {

      const pic = document.querySelector(".profile-pic")
      const description = document.querySelector(".description")

      let updateUserRef = null
      if(localStorage.getItem("account_type") == "company"){
        updateUserRef = doc(db, "companies", localStorage.getItem("userID"))
      }
      else{
        updateUserRef = doc(db, "users", localStorage.getItem("userID"))
      }
       
      document.getElementById("wait").style.display ="block"

      let oldmediaURL = ref(storage, `${localStorage.getItem("profile_pic")}`)

      const file =  profile_img_input.files[0]
      const mediaRef = ref(storage, `media/${ v4() }`);
      let mediaURL = ""

      uploadBytes(mediaRef, file).then( () => {
        getDownloadURL(mediaRef).then( (url) => {
          mediaURL = url
          console.log("uploading")

      updateDoc(updateUserRef , {
        description: edit_profile_desc.value,
        profile_pic: `${mediaURL}`
      })
      .then( () => {
        const commentPicq = query(commentRef, where("user_id", "==", localStorage.getItem("userID")))

        getDocs(commentPicq)
          .then( (snapshot) => {
            let comments = []
            snapshot.docs.forEach((doc) => {
              comments.push({...doc.data(), id: doc.id})
            })

            comments.forEach( (comment) => {
              let commnetRef =  doc(db, "comments", comment.id)
              updateDoc(commnetRef, {
                user_pic : `${mediaURL}`
              })
              .then( () => {
                localStorage.setItem("description", edit_profile_desc.value)
                localStorage.setItem("profile_pic", `${mediaURL}`)
                pic.src = localStorage.getItem("profile_pic")
                description.innerHTML = localStorage.getItem("description")
                blurr.style.display = "none"
                edit_profile_tab.style.display = "none"
                document.getElementById("wait").style.display ="none"
              })


            })

          }) 
        
        

      })
      .catch(() => {
        console.log("update error")
      })

      deleteObject(oldmediaURL).then( () => {
        console.log("media deleted")
      })
      .catch( () => {
        console.log("delete error")
      })

    })
  })
    })
  }


  //////////////////////////////////////////////////////////////////////////////

  //  Signing out  /////////////////////////////////////////////////////////////

  const sign_out = document.querySelector(".signout")
  const sign_out_tab = document.querySelector(".sign_out_tab")
  const sign_out_btn = document.querySelector("#sign_out_btn")
  const sign_out_cancel = document.querySelector("#sign_out_cancel")

  if(sign_out){
    sign_out.addEventListener("click", (e) => {
      blurr.style.display = "block"
      sign_out_tab.style.display = "block"
    })
  }

  if(sign_out_btn){
    sign_out_btn.addEventListener("click", (e) => {
      localStorage.clear()
      location.href = "login.html"
    })
  }

  if(sign_out_cancel){
    sign_out_cancel.addEventListener("click", (e) => {
      blurr.style.display = "none"
      sign_out_tab.style.display = "none"
    })
  }
}


//////////////////////////////////////////////////////////////////////////////



// Messages page ///////////////////////////////////////////////////////////

const message_page = document.getElementById("message_page")

if(message_page){

      if(!localStorage.getItem("userID")){
        blurr.style.display = "block"
        const text = "you are currently in guest mode if you want to check the website features please log in"
        if (confirm(text) == true) {
          location.href = "login.html"
        } 
      }

  document.querySelector(".profile-img").src = localStorage.getItem("profile_pic")
  document.querySelector(".username").innerHTML = localStorage.getItem("displayName")
  const search_input = document.querySelector(".search-input")
  const chat_list = document.querySelector(".chat-list")
  
  {
    blurr.style.display = "block"
    chat_list.innerHTML = null
    console.log("clearing")

    setTimeout(() => {
      if(localStorage.getItem("userID")){
        blurr.style.display = "none"
      }
      
    }, 3000);

    const q = query(chatRef, where("users", "array-contains", localStorage.getItem("userID")))
    let chats = []
    let users = []
    let users2 = []

    onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach( (doc) => {
        chats.push({...doc.data(), id:doc.id})
      })

      console.log("chat found")

      console.log(chats)
      const chat_header_img = document.querySelector(".chat-header-img")
      const chat_header_name = document.querySelector(".chat-header-name")
      const chat_box = document.querySelector(".chat-box") 


    chats.forEach( (chat) => {
      if(chat.users[0] != `${localStorage.getItem("userID")}`){

        const userRef = doc(db, "users", `${chat.users[0]}`)        

        onSnapshot(userRef, (user) => {
          users.push(user.data())
          console.log(user.data())

          let user_card = null
    
          user_card = createPosts(` 
            <div class="chat-item" id="${user.id}" >
              <img src="${user.data().profile_pic}" alt="User" class="chat-img">
                <div class="chat-info">
                  <p class="chat-name">${user.data().display_name}</p>
                  <p class="chat-message"></p>
                </div>
            </div>
          `)
          chat_list.appendChild(user_card)
          user_card.addEventListener("click", () => {

            chat_header_img.src = user_card.children[0].src
            chat_header_img.style.opacity = 1
            chat_header_name.innerHTML = user_card.children[1].children[0].innerHTML
            chat_box.innerHTML = null
            let chats = []
            let parts = [`${localStorage.getItem("userID")}`, `${user_card.id}`] 
            parts.sort()
            const chatq = query(chatRef, where("users", "==", parts) )

            getDocs(chatq)
            .then( (snapshot) => {
              snapshot.docs.forEach((doc) => {
                chats.push({...doc.data(), id: doc.id})
              })
  
              chat_box.id = chats[0].id
              const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
              onSnapshot(q, (snapshot) => {
                let messages = []
                snapshot.docs.forEach( (doc) => {
                  messages.push({...doc.data(), id:doc.id})
                })
  
                chat_box.innerHTML = null
                let message_card = null
                let user_message = null
  
                messages.forEach( (message) => {
                  console.log("adding messages")
                  if(message.user_id == localStorage.getItem("userID")) {user_message = true}
  
                  else {user_message = false}
  
                  message_card = createPosts(`
                    <div class="${user_message? "message sent": "message received"}"">
                      <p class="message-text">${message.text}</p>
                      <span class="message-time">${message.createdAT2}</span>
                    </div>
                    `)
                    chat_box.appendChild(message_card)
                })
  
              })
            })

            
          })

        })
       }
      else{ 
          
        const userRef = doc(db, "users", `${chat.users[1]}`) 

        onSnapshot(userRef, (user) => {
          users.push(user.data())
          console.log(user.data())

          let user_card = null
    
          user_card = createPosts(` 
            <div class="chat-item" id="${user.id}" >
              <img src="${user.data().profile_pic}" alt="User" class="chat-img">
                <div class="chat-info">
                  <p class="chat-name">${user.data().display_name}</p>
                  <p class="chat-message"></p>
                </div>
            </div>
          `)
          chat_list.appendChild(user_card)
          user_card.addEventListener("click", () => {

            chat_header_img.src = user_card.children[0].src
            chat_header_img.style.opacity = 1
            chat_header_name.innerHTML = user_card.children[1].children[0].innerHTML
            chat_box.innerHTML = null
            let chats = []
            let parts = [`${localStorage.getItem("userID")}`, `${user_card.id}`] 
            parts.sort()
            const chatq = query(chatRef, where("users", "==", parts) )

            getDocs(chatq)
            .then( (snapshot) => {
              snapshot.docs.forEach((doc) => {
                chats.push({...doc.data(), id: doc.id})
              })
  
              chat_box.id = chats[0].id
              const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
              onSnapshot(q, (snapshot) => {
                let messages = []
                snapshot.docs.forEach( (doc) => {
                  messages.push({...doc.data(), id:doc.id})
                })
  
                chat_box.innerHTML = null
                let message_card = null
                let user_message = null
  
                messages.forEach( (message) => {
                  console.log("adding messages")
                  if(message.user_id == localStorage.getItem("userID")) {user_message = true}
  
                  else {user_message = false}
  
                  message_card = createPosts(`
                    <div class="${user_message? "message sent": "message received"}"">
                      <p class="message-text">${message.text}</p>
                      <span class="message-time">${message.createdAT2}</span>
                    </div>
                    `)
                    chat_box.appendChild(message_card)
                })
  
              })
            })

            
          })

        })
      }
    })

    chats.forEach( (chat) => {
      if(chat.users[0] != `${localStorage.getItem("userID")}`){

        const userRef = doc(db, "companies", `${chat.users[0]}`)        

        onSnapshot(userRef, (user) => {
          users2.push(user.data())
          console.log(user.data())

          let user_card = null
    
          user_card = createPosts(` 
            <div class="chat-item" id="${user.id}" >
              <img src="${user.data().profile_pic}" alt="User" class="chat-img">
                <div class="chat-info">
                  <p class="chat-name">${user.data().name}</p>
                  <p class="chat-message"></p>
                </div>
            </div>
          `)
          chat_list.appendChild(user_card)
          user_card.addEventListener("click", () => {

            chat_header_img.src = user_card.children[0].src
            chat_header_img.style.opacity = 1
            chat_header_name.innerHTML = user_card.children[1].children[0].innerHTML
            chat_box.innerHTML = null
            let chats = []
            let parts = [`${localStorage.getItem("userID")}`, `${user_card.id}`] 
            parts.sort()
            const chatq = query(chatRef, where("users", "==", parts) )

            getDocs(chatq)
            .then( (snapshot) => {
              snapshot.docs.forEach((doc) => {
                chats.push({...doc.data(), id: doc.id})
              })
  
              chat_box.id = chats[0].id
              const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
              onSnapshot(q, (snapshot) => {
                let messages = []
                snapshot.docs.forEach( (doc) => {
                  messages.push({...doc.data(), id:doc.id})
                })
  
                chat_box.innerHTML = null
                let message_card = null
                let user_message = null
  
                messages.forEach( (message) => {
                  console.log("adding messages")
                  if(message.user_id == localStorage.getItem("userID")) {user_message = true}
  
                  else {user_message = false}
  
                  message_card = createPosts(`
                    <div class="${user_message? "message sent": "message received"}"">
                      <p class="message-text">${message.text}</p>
                      <span class="message-time">${message.createdAT2}</span>
                    </div>
                    `)
                    chat_box.appendChild(message_card)
                })
  
              })
            })

            
          })

        })
       }
      else{ 
          
        const userRef = doc(db, "companies", `${chat.users[1]}`) 

        onSnapshot(userRef, (user) => {
          users2.push(user.data())
          console.log(user.data())

          let user_card = null
    
          user_card = createPosts(` 
            <div class="chat-item" id="${user.id}" >
              <img src="${user.data().profile_pic}" alt="User" class="chat-img">
                <div class="chat-info">
                  <p class="chat-name">${user.data().name}</p>
                  <p class="chat-message"></p>
                </div>
            </div>
          `)
          chat_list.appendChild(user_card)
          user_card.addEventListener("click", () => {

            chat_header_img.src = user_card.children[0].src
            chat_header_img.style.opacity = 1
            chat_header_name.innerHTML = user_card.children[1].children[0].innerHTML
            chat_box.innerHTML = null
            let chats = []
            let parts = [`${localStorage.getItem("userID")}`, `${user_card.id}`] 
            parts.sort()
            const chatq = query(chatRef, where("users", "==", parts) )

            getDocs(chatq)
            .then( (snapshot) => {
              snapshot.docs.forEach((doc) => {
                chats.push({...doc.data(), id: doc.id})
              })
  
              chat_box.id = chats[0].id
              const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
              onSnapshot(q, (snapshot) => {
                let messages = []
                snapshot.docs.forEach( (doc) => {
                  messages.push({...doc.data(), id:doc.id})
                })
  
                chat_box.innerHTML = null
                let message_card = null
                let user_message = null
  
                messages.forEach( (message) => {
                  console.log("adding messages")
                  if(message.user_id == localStorage.getItem("userID")) {user_message = true}
  
                  else {user_message = false}
  
                  message_card = createPosts(`
                    <div class="${user_message? "message sent": "message received"}"">
                      <p class="message-text">${message.text}</p>
                      <span class="message-time">${message.createdAT2}</span>
                    </div>
                    `)
                    chat_box.appendChild(message_card)
                })
  
              })
            })

            
          })

        })
      }
    })
    })

    
  }
  

  search_input.addEventListener("input",() => {

    if(search_input.value == ""){
      chat_list.innerHTML = null
      console.log("clearing")
  
      const q = query(chatRef, where("users", "array-contains", localStorage.getItem("userID")))
      let chats = []
      let users = []
      let users2 = []
  
      onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach( (doc) => {
          chats.push({...doc.data(), id:doc.id})
        })
  
        console.log("chat found")
  
        console.log(chats)
        const chat_header_img = document.querySelector(".chat-header-img")
        const chat_header_name = document.querySelector(".chat-header-name")
        const chat_box = document.querySelector(".chat-box") 
  
  
      chats.forEach( (chat) => {
        if(chat.users[0] != `${localStorage.getItem("userID")}`){
  
          const userRef = doc(db, "users", `${chat.users[0]}`)        
  
          onSnapshot(userRef, (user) => {
            users.push(user.data())
            console.log(user.data())
  
            let user_card = null
      
            user_card = createPosts(` 
              <div class="chat-item" id="${user.id}" >
                <img src="${user.data().profile_pic}" alt="User" class="chat-img">
                  <div class="chat-info">
                    <p class="chat-name">${user.data().display_name}</p>
                    <p class="chat-message"></p>
                  </div>
              </div>
            `)
            chat_list.appendChild(user_card)
            user_card.addEventListener("click", () => {
  
              chat_header_img.src = user_card.children[0].src
              chat_header_img.style.opacity = 1
              chat_header_name.innerHTML = user_card.children[1].children[0].innerHTML
              chat_box.innerHTML = null
              let chats = []
              let parts = [`${localStorage.getItem("userID")}`, `${user_card.id}`] 
              parts.sort()
              const chatq = query(chatRef, where("users", "==", parts) )
  
              getDocs(chatq)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  chats.push({...doc.data(), id: doc.id})
                })
    
                chat_box.id = chats[0].id
                const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
                onSnapshot(q, (snapshot) => {
                  let messages = []
                  snapshot.docs.forEach( (doc) => {
                    messages.push({...doc.data(), id:doc.id})
                  })
    
                  chat_box.innerHTML = null
                  let message_card = null
                  let user_message = null
    
                  messages.forEach( (message) => {
                    console.log("adding messages")
                    if(message.user_id == localStorage.getItem("userID")) {user_message = true}
    
                    else {user_message = false}
    
                    message_card = createPosts(`
                      <div class="${user_message? "message sent": "message received"}"">
                        <p class="message-text">${message.text}</p>
                        <span class="message-time">${message.createdAT2}</span>
                      </div>
                      `)
                      chat_box.appendChild(message_card)
                  })
    
                })
              })
  
              
            })
  
          })
         }
        else{ 
            
          const userRef = doc(db, "users", `${chat.users[1]}`) 
  
          onSnapshot(userRef, (user) => {
            users.push(user.data())
            console.log(user.data())
  
            let user_card = null
      
            user_card = createPosts(` 
              <div class="chat-item" id="${user.id}" >
                <img src="${user.data().profile_pic}" alt="User" class="chat-img">
                  <div class="chat-info">
                    <p class="chat-name">${user.data().display_name}</p>
                    <p class="chat-message"></p>
                  </div>
              </div>
            `)
            chat_list.appendChild(user_card)
            user_card.addEventListener("click", () => {
  
              chat_header_img.src = user_card.children[0].src
              chat_header_img.style.opacity = 1
              chat_header_name.innerHTML = user_card.children[1].children[0].innerHTML
              chat_box.innerHTML = null
              let chats = []
              let parts = [`${localStorage.getItem("userID")}`, `${user_card.id}`] 
              parts.sort()
              const chatq = query(chatRef, where("users", "==", parts) )
  
              getDocs(chatq)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  chats.push({...doc.data(), id: doc.id})
                })
    
                chat_box.id = chats[0].id
                const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
                onSnapshot(q, (snapshot) => {
                  let messages = []
                  snapshot.docs.forEach( (doc) => {
                    messages.push({...doc.data(), id:doc.id})
                  })
    
                  chat_box.innerHTML = null
                  let message_card = null
                  let user_message = null
    
                  messages.forEach( (message) => {
                    console.log("adding messages")
                    if(message.user_id == localStorage.getItem("userID")) {user_message = true}
    
                    else {user_message = false}
    
                    message_card = createPosts(`
                      <div class="${user_message? "message sent": "message received"}"">
                        <p class="message-text">${message.text}</p>
                        <span class="message-time">${message.createdAT2}</span>
                      </div>
                      `)
                      chat_box.appendChild(message_card)
                  })
    
                })
              })
  
              
            })
  
          })
        }
      })
  
      chats.forEach( (chat) => {
        if(chat.users[0] != `${localStorage.getItem("userID")}`){
  
          const userRef = doc(db, "companies", `${chat.users[0]}`)        
  
          onSnapshot(userRef, (user) => {
            users2.push(user.data())
            console.log(user.data())
  
            let user_card = null
      
            user_card = createPosts(` 
              <div class="chat-item" id="${user.id}" >
                <img src="${user.data().profile_pic}" alt="User" class="chat-img">
                  <div class="chat-info">
                    <p class="chat-name">${user.data().name}</p>
                    <p class="chat-message"></p>
                  </div>
              </div>
            `)
            chat_list.appendChild(user_card)
            user_card.addEventListener("click", () => {
  
              chat_header_img.src = user_card.children[0].src
              chat_header_img.style.opacity = 1
              chat_header_name.innerHTML = user_card.children[1].children[0].innerHTML
              chat_box.innerHTML = null
              let chats = []
              let parts = [`${localStorage.getItem("userID")}`, `${user_card.id}`] 
              parts.sort()
              const chatq = query(chatRef, where("users", "==", parts) )
  
              getDocs(chatq)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  chats.push({...doc.data(), id: doc.id})
                })
    
                chat_box.id = chats[0].id
                const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
                onSnapshot(q, (snapshot) => {
                  let messages = []
                  snapshot.docs.forEach( (doc) => {
                    messages.push({...doc.data(), id:doc.id})
                  })
    
                  chat_box.innerHTML = null
                  let message_card = null
                  let user_message = null
    
                  messages.forEach( (message) => {
                    console.log("adding messages")
                    if(message.user_id == localStorage.getItem("userID")) {user_message = true}
    
                    else {user_message = false}
    
                    message_card = createPosts(`
                      <div class="${user_message? "message sent": "message received"}"">
                        <p class="message-text">${message.text}</p>
                        <span class="message-time">${message.createdAT2}</span>
                      </div>
                      `)
                      chat_box.appendChild(message_card)
                  })
    
                })
              })
  
              
            })
  
          })
         }
        else{ 
            
          const userRef = doc(db, "companies", `${chat.users[1]}`) 
  
          onSnapshot(userRef, (user) => {
            users2.push(user.data())
            console.log(user.data())
  
            let user_card = null
      
            user_card = createPosts(` 
              <div class="chat-item" id="${user.id}" >
                <img src="${user.data().profile_pic}" alt="User" class="chat-img">
                  <div class="chat-info">
                    <p class="chat-name">${user.data().name}</p>
                    <p class="chat-message"></p>
                  </div>
              </div>
            `)
            chat_list.appendChild(user_card)
            user_card.addEventListener("click", () => {
  
              chat_header_img.src = user_card.children[0].src
              chat_header_img.style.opacity = 1
              chat_header_name.innerHTML = user_card.children[1].children[0].innerHTML
              chat_box.innerHTML = null
              let chats = []
              let parts = [`${localStorage.getItem("userID")}`, `${user_card.id}`] 
              parts.sort()
              const chatq = query(chatRef, where("users", "==", parts) )
  
              getDocs(chatq)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  chats.push({...doc.data(), id: doc.id})
                })
    
                chat_box.id = chats[0].id
                const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
                onSnapshot(q, (snapshot) => {
                  let messages = []
                  snapshot.docs.forEach( (doc) => {
                    messages.push({...doc.data(), id:doc.id})
                  })
    
                  chat_box.innerHTML = null
                  let message_card = null
                  let user_message = null
    
                  messages.forEach( (message) => {
                    console.log("adding messages")
                    if(message.user_id == localStorage.getItem("userID")) {user_message = true}
    
                    else {user_message = false}
    
                    message_card = createPosts(`
                      <div class="${user_message? "message sent": "message received"}"">
                        <p class="message-text">${message.text}</p>
                        <span class="message-time">${message.createdAT2}</span>
                      </div>
                      `)
                      chat_box.appendChild(message_card)
                  })
    
                })
              })
  
              
            })
  
          })
        }
      })
  
      })


    }
    else{
      const q = query(userRef, and( where("display_name", ">=", `${search_input.value}`), where("display_name", "<=", `${search_input.value}` + "\uf8ff")), limit(10))
      const q2 = query(companyRef, and( where("name", ">=", `${search_input.value}`), where("name", "<=", `${search_input.value}` + "\uf8ff")), limit(10))
      
      chat_list.innerHTML = null

      onSnapshot(q, (snapshot) => {
        let users = []
        snapshot.docs.forEach( (doc) => {
          users.push({...doc.data(), id:doc.id})
        })

        let user_card = null

        users.forEach( (user) => {
           user_card = createPosts(` 
              <div class="chat-item" id="${user.id}" >
                <img src="${user.profile_pic}" alt="User" class="chat-img">
                  <div class="chat-info">
                    <p class="chat-name">${user.display_name}</p>
                    <p class="chat-message"></p>
                  </div>
              </div>
            `)
            chat_list.appendChild(user_card)
        })

        // const chat_header_img = document.querySelector(".chat-header-img")
        // const chat_header_name = document.querySelector(".chat-header-name")
        // const chat_box = document.querySelector(".chat-box") 
        // const htmlcollection = document.getElementsByClassName("chat-item")
        // const arr = Array.prototype.slice.call(htmlcollection);

        // arr.forEach( (card) => {
        //   card.addEventListener("click", () => {

        //     chat_header_img.src = card.children[0].src
        //     chat_header_img.style.opacity = 1
        //     chat_header_name.innerHTML = card.children[1].children[0].innerHTML
        //     chat_box.innerHTML = null

        //     let chats = []
        //     let parts = [`${localStorage.getItem("userID")}`, `${card.id}`] 
        //     parts.sort()

        //     const chatq = query(chatRef, where("users", "==", parts) )

        //     getDocs(chatq)
        //       .then( (snapshot) => {
        //         snapshot.docs.forEach((doc) => {
        //           chats.push({...doc.data(), id: doc.id})
        //         })

        //         if(chats.length != 0){
        //           chat_box.id = chats[0].id
        //           const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
        //           onSnapshot(q, (snapshot) => {
        //             let messages = []
        //             snapshot.docs.forEach( (doc) => {
        //               messages.push({...doc.data(), id:doc.id})
        //             })

        //             chat_box.innerHTML = null
        //             let message_card = null
        //             let user_message = null

        //             messages.forEach( (message) => {
        //               console.log("adding messages")
        //               if(message.user_id == localStorage.getItem("userID")) {user_message = true}

        //               else {user_message = false}

        //               message_card = createPosts(`
        //                 <div class="${user_message? "message sent": "message received"}"">
        //                   <p class="message-text">${message.text}</p>
        //                   <span class="message-time">${message.createdAT2}</span>
        //                 </div>
        //                 `)
        //                 chat_box.appendChild(message_card)
        //             })

        //           })

        //         }
        //         else{
        //           addDoc(chatRef, {
        //             is_group: false,
        //             name:"",
        //             users: parts
        //           })
        //           .then( () =>{
        //             getDocs(chatq)
        //             .then( (snapshot) => {
        //               snapshot.docs.forEach((doc) => {
        //                 chats.push({...doc.data(), id: doc.id})
        //               })
                      
        //               chat_box.id = chats[0].id
        //               const q = query(messageRef, where("chat_id", "==", chats[0].id ))
        //               onSnapshot(q, (snapshot) => {
        //                 let messages = []
        //                 snapshot.docs.forEach( (doc) => {
        //                   messages.push({...doc.data(), id:doc.id})
        //                 })
    
        //                 chat_box.innerHTML = null
        //                 let message_card = null
        //                 let user_message = null
    
        //                 messages.forEach( (message) => {
        //                   console.log("adding messages")
        //                   if(message.user_id == localStorage.getItem("user_id")) {user_message = true}
        //                   else {user_message = false}
    
        //                   message_card = createPosts(`
        //                     <div class="${user_message? "message sent": "message received"}"">
        //                       <p class="message-text">${message.text}</p>
        //                       <span class="message-time">${message.createdAT2}</span>
        //                     </div>
        //                     `)
        //                     chat_box.appendChild(message_card)
        //                 })
    
        //               })

        //             })
        //           })
        //         }

        //       })
        //   })

        // })



  
      })

      onSnapshot(q2, (snapshot) => {
        let users2 =[]
        snapshot.docs.forEach( (doc) => {
          users2.push({...doc.data(), id:doc.id})
        })

        let user_card = null

        users2.forEach( (user) => {
           user_card = createPosts(` 
              <div class="chat-item" id="${user.id}" >
                <img src="${user.profile_pic}" alt="User" class="chat-img">
                  <div class="chat-info">
                    <p class="chat-name">${user.name}</p>
                    <p class="chat-message"></p>
                  </div>
              </div>
            `)
            chat_list.appendChild(user_card)
        })

        const chat_header_img = document.querySelector(".chat-header-img")
        const chat_header_name = document.querySelector(".chat-header-name")
        const chat_box = document.querySelector(".chat-box") 
        const htmlcollection = document.getElementsByClassName("chat-item")
        const arr = Array.prototype.slice.call(htmlcollection);

        arr.forEach( (card) => {
          card.addEventListener("click", () => {

            chat_header_img.src = card.children[0].src
            chat_header_img.style.opacity = 1
            chat_header_name.innerHTML = card.children[1].children[0].innerHTML
            chat_box.innerHTML = null

            let chats = []
            let parts = [`${localStorage.getItem("userID")}`, `${card.id}`] 
            parts.sort()

            const chatq = query(chatRef, where("users", "==", parts) )

            getDocs(chatq)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  chats.push({...doc.data(), id: doc.id})
                })

                if(chats.length != 0){
                  chat_box.id = chats[0].id
                  const q = query(messageRef, where("chat_id", "==", chats[0].id ), orderBy("createdAT", "asc") )
                  onSnapshot(q, (snapshot) => {
                    let messages = []
                    snapshot.docs.forEach( (doc) => {
                      messages.push({...doc.data(), id:doc.id})
                    })

                    chat_box.innerHTML = null
                    let message_card = null
                    let user_message = null

                    messages.forEach( (message) => {
                      console.log("adding messages")
                      if(message.user_id == localStorage.getItem("userID")) {user_message = true}

                      else {user_message = false}

                      message_card = createPosts(`
                        <div class="${user_message? "message sent": "message received"}"">
                          <p class="message-text">${message.text}</p>
                          <span class="message-time">${message.createdAT2}</span>
                        </div>
                        `)
                        chat_box.appendChild(message_card)
                    })

                  })

                }
                else{
                  addDoc(chatRef, {
                    is_group: false,
                    name:"",
                    users: parts
                  })
                  .then( () =>{
                    getDocs(chatq)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        chats.push({...doc.data(), id: doc.id})
                      })
                      
                      chat_box.id = chats[0].id
                      const q = query(messageRef, where("chat_id", "==", chats[0].id ))
                      onSnapshot(q, (snapshot) => {
                        let messages = []
                        snapshot.docs.forEach( (doc) => {
                          messages.push({...doc.data(), id:doc.id})
                        })
    
                        chat_box.innerHTML = null
                        let message_card = null
                        let user_message = null
    
                        messages.forEach( (message) => {
                          console.log("adding messages")
                          if(message.user_id == localStorage.getItem("user_id")) {user_message = true}
                          else {user_message = false}
    
                          message_card = createPosts(`
                            <div class="${user_message? "message sent": "message received"}"">
                              <p class="message-text">${message.text}</p>
                              <span class="message-time">${message.createdAT2}</span>
                            </div>
                            `)
                            chat_box.appendChild(message_card)
                        })
    
                      })

                    })
                  })
                }

              })
          })

        })



  
      })

    }

  })
  

// sending a message //////////////////////////////////////////////////////////
const message_input = document.querySelector(".message-input") 
const send_btn = document.querySelector(".send-btn")
const chat_box = document.querySelector(".chat-box")


send_btn.addEventListener("click", () => {
  console.log("checking")

  if(message_input.value != "" && chat_box.id != ""){
    console.log("Sending message")
    addDoc(messageRef, {
      chat_id: chat_box.id,
      user_id: localStorage.getItem("userID"),
      text: message_input.value,
      createdAT: serverTimestamp(),
      createdAT2:`${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`
    })
    .then( () => {
      console.log("Message sent")
      message_input.value = ""
    })
  }
})



}


//////////////////////////////////////////////////////////////////////////////



// displaying posts in work page /////////////////////////////////////////////

const work_page_id = document.querySelector(".work-section2")

// const comment_tab = document.querySelector(".make_comment_tab")
// const comment_text2 = document.querySelector(".comment_text2")
// const make_comment_btn = document.querySelector(".make_comment_btn")
// const make_comment_cancel = document.querySelector(".make_comment_cancel")
// const loading = document.querySelector(".loading")

// let post_id_comment = ""
const CV_input = document.querySelector(".CV_input")
let post_id_apply2 = ""



if(work_page_id) {

  let most_liked = localStorage.getItem("most_liked")? localStorage.getItem("most_liked").toLowerCase().split(",") : ["0","0","0","0","0","0"]
  const q = query(postRef, where("type", "==", "work"), orderBy("createdAT", "desc"))
  const q2 = query(postRef, and(where("type", "==", "work"), where("tag", "in", most_liked)), orderBy("createdAT", "desc")  )
  const q3 = query(postRef, and(where("type", "==", "work"), where("tag", "not-in", most_liked)), orderBy("createdAT", "desc")  )
  
  let posts = []

  if(filter_btn){
    filter_btn.addEventListener("click", () => {

      if(filter.value == "Username" && filter_input.value != ""){

        const userq = query(postRef, and(where("type", "==", "work"), where("user_display_name", ">=", `${filter_input.value}`), where("user_display_name", "<=", `${filter_input.value}` + "\uf8ff")), orderBy("createdAT", "desc")  ) 
        console.log("Looking for user")
        loading.style.display = "block"

        getDocs(userq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })

          
          loading.style.display = "none"
          work_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    <button id="apply" class="react-box">
                      <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".work-section2").appendChild(community_posts);
          })
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);
    
          const applycollection = document.querySelectorAll("#apply")
          const arr5 = Array.prototype.slice.call(applycollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
    
          arr5.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                volunteer_form.email.value = `${localStorage.getItem("email")}`
                post_id_apply = elmnt.children[0].id
                blurr.style.display = "block"
                apply_tab.style.display = "block"
              }
    
            })
          })
    
          if(CV_input){
            CV_input.addEventListener("input",function() {
              const reader = new FileReader()
              reader.readAsDataURL(this.files[0])
            })
          }
    
          if(apply_btn){
            apply_btn.addEventListener("click", (e) => {
              e.preventDefault()
              loading.style.display = "block"
    
              const file =  volunteer_form.CV.files[0]
              const mediaRef = ref(storage, `media/${ v4() }`);
              let mediaURL = ""
    
            uploadBytes(mediaRef, file)
            .then( () => {
              console.log("image uploaded")
              getDownloadURL(mediaRef).then( (url) =>{
                mediaURL = url
        
                addDoc(formsRef, {
                  name: volunteer_form.name.value,
                  email: volunteer_form.email.value,
                  phone: volunteer_form.phone.value,
                  address: volunteer_form.address.value,
                  DOB: volunteer_form.date.value,
                  CV: mediaURL,
                  createdAT: serverTimestamp(),
                  createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                  type: "work",
                  user_id: localStorage.getItem("userID"),
                  post_id: post_id_apply
                })
                .then( () => {
                  post_id_apply = ""
                  loading.style.display = "none"
                  apply_tab.style.display = "none"
                  blurr.style.display = "none"
                  volunteer_form.reset()
                })
                .catch( (error) => {
                  console.log(error)
                })
    
    
              })
            })          
              
            })
          }
    
          if(cancel_apply_btn){
            cancel_apply_btn.addEventListener("click", () => {
              volunteer_form.reset()
              post_id_apply = ""
              apply_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
         })
        .catch(err => {
        console.log(err.message)
        })
      }
      else if(filter.value == "Description" && filter_input.value != ""){

        const filterValue = filter_input.value.toLowerCase().trim()
        filter_input.value = filterValue
        const descq = query(postRef, and(where("type", "==", "work"), where("description", ">=", `${filter_input.value}`), where("description", "<=", `${filter_input.value}` + "\uf8ff")), orderBy("createdAT", "desc")  ) 

        console.log("looking for desc")
        loading.style.display = "block"   

        getDocs(descq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          work_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    <button id="apply" class="react-box">
                      <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".work-section2").appendChild(community_posts);
          })
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);
    
          const applycollection = document.querySelectorAll("#apply")
          const arr5 = Array.prototype.slice.call(applycollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
    
          arr5.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                volunteer_form.email.value = `${localStorage.getItem("email")}`
                post_id_apply = elmnt.children[0].id
                blurr.style.display = "block"
                apply_tab.style.display = "block"
              }
    
            })
          })
    
          if(CV_input){
            CV_input.addEventListener("input",function() {
              const reader = new FileReader()
              reader.readAsDataURL(this.files[0])
            })
          }
    
          if(apply_btn){
            apply_btn.addEventListener("click", (e) => {
              e.preventDefault()
              loading.style.display = "block"
    
              const file =  volunteer_form.CV.files[0]
              const mediaRef = ref(storage, `media/${ v4() }`);
              let mediaURL = ""
    
            uploadBytes(mediaRef, file)
            .then( () => {
              console.log("image uploaded")
              getDownloadURL(mediaRef).then( (url) =>{
                mediaURL = url
        
                addDoc(formsRef, {
                  name: volunteer_form.name.value,
                  email: volunteer_form.email.value,
                  phone: volunteer_form.phone.value,
                  address: volunteer_form.address.value,
                  DOB: volunteer_form.date.value,
                  CV: mediaURL,
                  createdAT: serverTimestamp(),
                  createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                  type: "work",
                  user_id: localStorage.getItem("userID"),
                  post_id: post_id_apply
                })
                .then( () => {
                  post_id_apply = ""
                  loading.style.display = "none"
                  apply_tab.style.display = "none"
                  blurr.style.display = "none"
                  volunteer_form.reset()
                })
                .catch( (error) => {
                  console.log(error)
                })
    
    
              })
            })          
              
            })
          }
    
          if(cancel_apply_btn){
            cancel_apply_btn.addEventListener("click", () => {
              volunteer_form.reset()
              post_id_apply = ""
              apply_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
         })
        .catch(err => {
        console.log(err.message)
        })

      }
      else if(filter.value == "Tag" && filter_input.value != ""){

        const filterValue = filter_input.value.toLowerCase().trim()
        filter_input.value = filterValue
        const tagq = query(postRef, and(where("type", "==", "work"), where("tag", ">=", `${filter_input.value}`), where("tag", "<=", `${filter_input.value}` + "\uf8ff")),orderBy("createdAT", "desc")  ) 

        console.log("looking for tag")
        loading.style.display = "block"

        getDocs(tagq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
    
          
          loading.style.display = "none"
          work_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    <button id="apply" class="react-box">
                      <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".work-section2").appendChild(community_posts);
          })
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);
    
          const applycollection = document.querySelectorAll("#apply")
          const arr5 = Array.prototype.slice.call(applycollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
    
          arr5.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                volunteer_form.email.value = `${localStorage.getItem("email")}`
                post_id_apply = elmnt.children[0].id
                blurr.style.display = "block"
                apply_tab.style.display = "block"
              }
    
            })
          })
    
          if(CV_input){
            CV_input.addEventListener("input",function() {
              const reader = new FileReader()
              reader.readAsDataURL(this.files[0])
            })
          }
    
          if(apply_btn){
            apply_btn.addEventListener("click", (e) => {
              e.preventDefault()
              loading.style.display = "block"
    
              const file =  volunteer_form.CV.files[0]
              const mediaRef = ref(storage, `media/${ v4() }`);
              let mediaURL = ""
    
            uploadBytes(mediaRef, file)
            .then( () => {
              console.log("image uploaded")
              getDownloadURL(mediaRef).then( (url) =>{
                mediaURL = url
        
                addDoc(formsRef, {
                  name: volunteer_form.name.value,
                  email: volunteer_form.email.value,
                  phone: volunteer_form.phone.value,
                  address: volunteer_form.address.value,
                  DOB: volunteer_form.date.value,
                  CV: mediaURL,
                  createdAT: serverTimestamp(),
                  createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                  type: "work",
                  user_id: localStorage.getItem("userID"),
                  post_id: post_id_apply
                })
                .then( () => {
                  post_id_apply = ""
                  loading.style.display = "none"
                  apply_tab.style.display = "none"
                  blurr.style.display = "none"
                  volunteer_form.reset()
                })
                .catch( (error) => {
                  console.log(error)
                })
    
    
              })
            })          
              
            })
          }
    
          if(cancel_apply_btn){
            cancel_apply_btn.addEventListener("click", () => {
              volunteer_form.reset()
              post_id_apply = ""
              apply_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
         })
        .catch(err => {
        console.log(err.message)
        })

      }
      else if(filter.value == "Recommended" && filter_input.value != ""){

        if(most_liked[1] == "0" && most_liked[3] == "0" && most_liked[5] == "0"){
          getDocs(q)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
      
            
            loading.style.display = "none"
            work_page_id.innerHTML = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
              ${e.textonly? 
   `<textarea disabled class="text-only-description" >${e.description}</textarea>`
                :` 
                <p class="description">${e.description}</p>
                <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
              `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                      <button id="share-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px" 
                              src="./image/share-from-square-regular.svg" 
                              alt="share"/>Share
                      </button>
                      <button id="apply" class="react-box">
                        <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                      </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".work-section2").appendChild(community_posts);
            })
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);
      
            const applycollection = document.querySelectorAll("#apply")
            const arr5 = Array.prototype.slice.call(applycollection);
  
            const profilecollection = document.querySelectorAll(".user_profile_pic")
            const arr6 = Array.prototype.slice.call(profilecollection);

            const sharecollection = document.querySelectorAll("#share-btn")
            const arr7 = Array.prototype.slice.call(sharecollection);
      
            arr7.forEach( (elmnt) => {
      
              elmnt.addEventListener("click", () => {
      
                copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
                alert("link copied")
              })
      
            })
  
            arr6.forEach( (elmnt) => {
              elmnt.addEventListener("click", () => {
  
                localStorage.setItem("other_user", `${elmnt.id}`)
                location.href = "Profile2.html"
              })
  
            })
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
      
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
      
            arr5.forEach( (elmnt) => {
              elmnt.addEventListener("click", () => {
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                  volunteer_form.email.value = `${localStorage.getItem("email")}`
                  post_id_apply = elmnt.children[0].id
                  blurr.style.display = "block"
                  apply_tab.style.display = "block"
                }
      
              })
            })
      
            if(CV_input){
              CV_input.addEventListener("input",function() {
                const reader = new FileReader()
                reader.readAsDataURL(this.files[0])
              })
            }
      
            if(apply_btn){
              apply_btn.addEventListener("click", (e) => {
                e.preventDefault()
                loading.style.display = "block"
      
                const file =  volunteer_form.CV.files[0]
                const mediaRef = ref(storage, `media/${ v4() }`);
                let mediaURL = ""
      
              uploadBytes(mediaRef, file)
              .then( () => {
                console.log("image uploaded")
                getDownloadURL(mediaRef).then( (url) =>{
                  mediaURL = url
          
                  addDoc(formsRef, {
                    name: volunteer_form.name.value,
                    email: volunteer_form.email.value,
                    phone: volunteer_form.phone.value,
                    address: volunteer_form.address.value,
                    DOB: volunteer_form.date.value,
                    CV: mediaURL,
                    createdAT: serverTimestamp(),
                    createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                    type: "work",
                    user_id: localStorage.getItem("userID"),
                    post_id: post_id_apply
                  })
                  .then( () => {
                    post_id_apply = ""
                    loading.style.display = "none"
                    apply_tab.style.display = "none"
                    blurr.style.display = "none"
                    volunteer_form.reset()
                  })
                  .catch( (error) => {
                    console.log(error)
                  })
      
      
                })
              })          
                
              })
            }
      
            if(cancel_apply_btn){
              cancel_apply_btn.addEventListener("click", () => {
                volunteer_form.reset()
                post_id_apply = ""
                apply_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
           })
          .catch(err => {
          console.log(err.message)
          })
        
        }
        else{
          getDocs(q2)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
      
            
            loading.style.display = "none"
            work_page_id.innerHTML = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
              ${e.textonly? 
   `<textarea disabled class="text-only-description" >${e.description}</textarea>`
                :` 
                <p class="description">${e.description}</p>
                <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
              `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                      <button id="share-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px" 
                              src="./image/share-from-square-regular.svg" 
                              alt="share"/>Share
                      </button>
                      <button id="apply" class="react-box">
                        <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                      </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".work-section2").appendChild(community_posts);
            })
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);
      
            const applycollection = document.querySelectorAll("#apply")
            const arr5 = Array.prototype.slice.call(applycollection);
  
            const profilecollection = document.querySelectorAll(".user_profile_pic")
            const arr6 = Array.prototype.slice.call(profilecollection);
  
            arr6.forEach( (elmnt) => {
              elmnt.addEventListener("click", () => {
  
                localStorage.setItem("other_user", `${elmnt.id}`)
                location.href = "Profile2.html"
              })
  
            })
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
      
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
      
            arr5.forEach( (elmnt) => {
              elmnt.addEventListener("click", () => {
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                  volunteer_form.email.value = `${localStorage.getItem("email")}`
                  post_id_apply = elmnt.children[0].id
                  blurr.style.display = "block"
                  apply_tab.style.display = "block"
                }
      
              })
            })
      
            if(CV_input){
              CV_input.addEventListener("input",function() {
                const reader = new FileReader()
                reader.readAsDataURL(this.files[0])
              })
            }
      
            if(apply_btn){
              apply_btn.addEventListener("click", (e) => {
                e.preventDefault()
                loading.style.display = "block"
      
                const file =  volunteer_form.CV.files[0]
                const mediaRef = ref(storage, `media/${ v4() }`);
                let mediaURL = ""
      
              uploadBytes(mediaRef, file)
              .then( () => {
                console.log("image uploaded")
                getDownloadURL(mediaRef).then( (url) =>{
                  mediaURL = url
          
                  addDoc(formsRef, {
                    name: volunteer_form.name.value,
                    email: volunteer_form.email.value,
                    phone: volunteer_form.phone.value,
                    address: volunteer_form.address.value,
                    DOB: volunteer_form.date.value,
                    CV: mediaURL,
                    createdAT: serverTimestamp(),
                    createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                    type: "work",
                    user_id: localStorage.getItem("userID"),
                    post_id: post_id_apply
                  })
                  .then( () => {
                    post_id_apply = ""
                    loading.style.display = "none"
                    apply_tab.style.display = "none"
                    blurr.style.display = "none"
                    volunteer_form.reset()
                  })
                  .catch( (error) => {
                    console.log(error)
                  })
      
      
                })
              })          
                
              })
            }
      
            if(cancel_apply_btn){
              cancel_apply_btn.addEventListener("click", () => {
                volunteer_form.reset()
                post_id_apply = ""
                apply_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
           })
          .catch(err => {
          console.log(err.message)
          })
      
          getDocs(q3)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
      
            
            loading.style.display = "none"
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
              ${e.textonly? 
   `<textarea disabled class="text-only-description" >${e.description}</textarea>`
                :` 
                <p class="description">${e.description}</p>
                <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
              `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                      <button id="share-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px" 
                              src="./image/share-from-square-regular.svg" 
                              alt="share"/>Share
                      </button>
                      <button id="apply" class="react-box">
                        <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                      </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".work-section2").appendChild(community_posts);
            })
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);
      
            const applycollection = document.querySelectorAll("#apply")
            const arr5 = Array.prototype.slice.call(applycollection);
  
            const profilecollection = document.querySelectorAll(".user_profile_pic")
            const arr6 = Array.prototype.slice.call(profilecollection);

            const sharecollection = document.querySelectorAll("#share-btn")
            const arr7 = Array.prototype.slice.call(sharecollection);
      
            arr7.forEach( (elmnt) => {
      
              elmnt.addEventListener("click", () => {
      
                copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
                alert("link copied")
              })
      
            })
  
            arr6.forEach( (elmnt) => {
              elmnt.addEventListener("click", () => {
  
                localStorage.setItem("other_user", `${elmnt.id}`)
                location.href = "Profile2.html"
              })
  
            })
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
      
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
      
            arr5.forEach( (elmnt) => {
              elmnt.addEventListener("click", () => {
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                  volunteer_form.email.value = `${localStorage.getItem("email")}`
                  post_id_apply = elmnt.children[0].id
                  blurr.style.display = "block"
                  apply_tab.style.display = "block"
                }
      
              })
            })
      
            if(CV_input){
              CV_input.addEventListener("input",function() {
                const reader = new FileReader()
                reader.readAsDataURL(this.files[0])
              })
            }
      
            if(apply_btn){
              apply_btn.addEventListener("click", (e) => {
                e.preventDefault()
                loading.style.display = "block"
      
                const file =  volunteer_form.CV.files[0]
                const mediaRef = ref(storage, `media/${ v4() }`);
                let mediaURL = ""
      
              uploadBytes(mediaRef, file)
              .then( () => {
                console.log("image uploaded")
                getDownloadURL(mediaRef).then( (url) =>{
                  mediaURL = url
          
                  addDoc(formsRef, {
                    name: volunteer_form.name.value,
                    email: volunteer_form.email.value,
                    phone: volunteer_form.phone.value,
                    address: volunteer_form.address.value,
                    DOB: volunteer_form.date.value,
                    CV: mediaURL,
                    createdAT: serverTimestamp(),
                    createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                    type: "work",
                    user_id: localStorage.getItem("userID"),
                    post_id: post_id_apply
                  })
                  .then( () => {
                    post_id_apply = ""
                    loading.style.display = "none"
                    apply_tab.style.display = "none"
                    blurr.style.display = "none"
                    volunteer_form.reset()
                  })
                  .catch( (error) => {
                    console.log(error)
                  })
      
      
                })
              })          
                
              })
            }
      
            if(cancel_apply_btn){
              cancel_apply_btn.addEventListener("click", () => {
                volunteer_form.reset()
                post_id_apply = ""
                apply_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
           })
          .catch(err => {
          console.log(err.message)
          })
      
        }

      }
      else if(filter.value == "Date"){

        const dateq = query(postRef, where("type", "==", "work"), orderBy("createdAT", "desc")  ) 

        loading.style.display = "block"

        getDocs(dateq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          work_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    <button id="apply" class="react-box">
                      <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".work-section2").appendChild(community_posts);
          })
    
          //1
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
         })
         .catch(err => {
          console.log(err.message)
          })



      }

    })
  }


  if(most_liked[1] == "0" && most_liked[3] == "0" && most_liked[5] == "0"){
    getDocs(q)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      if(document.querySelector(".main2")){
        document.querySelector(".main2").style.display = "none"
      }
      
      loading.style.display = "none"
      work_page_id.innerHTML = ""
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
      ${e.textonly? 
        `<textarea disabled class="description" style="margin-bottom: 0; height: 226px;width: 100%;background-color: #00000000;border: 0px;resize: none;font-size: x-large;white-space: break-spaces; text-wrap: auto; overflow: scroll;">${e.description}</textarea>`
        :` 
        <p class="description">${e.description}</p>
        <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
      `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
              <button id="share-btn" class="react-box">
                <img  id=${e.id}
                      width="20px"
                      height="20px" 
                      src="./image/share-from-square-regular.svg" 
                      alt="share"/>Share
              </button>
                <button id="apply" class="react-box">
                  <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".work-section2").appendChild(community_posts);
      })

      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const applycollection = document.querySelectorAll("#apply")
      const arr5 = Array.prototype.slice.call(applycollection);

      const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
          alert("link copied")
        })

      })
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }

      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })


      arr5.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {
          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            volunteer_form.name.value = `${localStorage.getItem("displayName")}`
            volunteer_form.email.value = `${localStorage.getItem("email")}`
            post_id_apply = elmnt.children[0].id
            blurr.style.display = "block"
            apply_tab.style.display = "block"
          }

        })
      })

      if(CV_input){
        CV_input.addEventListener("input",function() {
          const reader = new FileReader()
          reader.readAsDataURL(this.files[0])
        })
      }

      if(apply_btn){
        apply_btn.addEventListener("click", (e) => {
          e.preventDefault()
          loading.style.display = "block"

          const file =  volunteer_form.CV.files[0]
          const mediaRef = ref(storage, `media/${ v4() }`);
          let mediaURL = ""

        uploadBytes(mediaRef, file)
        .then( () => {
          console.log("image uploaded")
          getDownloadURL(mediaRef).then( (url) =>{
            mediaURL = url
    
            addDoc(formsRef, {
              name: volunteer_form.name.value,
              email: volunteer_form.email.value,
              phone: volunteer_form.phone.value,
              address: volunteer_form.address.value,
              DOB: volunteer_form.date.value,
              CV: mediaURL,
              createdAT: serverTimestamp(),
              createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
              type: "work",
              user_id: localStorage.getItem("userID"),
              post_id: post_id_apply
            })
            .then( () => {
              post_id_apply = ""
              loading.style.display = "none"
              apply_tab.style.display = "none"
              blurr.style.display = "none"
              volunteer_form.reset()
            })
            .catch( (error) => {
              console.log(error)
            })


          })
        })          
          
        })
      }

      if(cancel_apply_btn){
        cancel_apply_btn.addEventListener("click", () => {
          volunteer_form.reset()
          post_id_apply = ""
          apply_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


     })
     .catch(err => {
      console.log(err.message)
      })

  
  }
  else{
    getDocs(q2)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      if(document.querySelector(".main2")){
        document.querySelector(".main2").style.display = "none"
      }
      
      loading.style.display = "none"
      work_page_id.innerHTML = ""
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
      ${e.textonly? 
        `<textarea disabled class="description" style="margin-bottom: 0; height: 226px;width: 100%;background-color: #00000000;border: 0px;resize: none;font-size: x-large;white-space: break-spaces; text-wrap: auto; overflow: scroll;">${e.description}</textarea>`
        :` 
        <p class="description">${e.description}</p>
        <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
      `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
              <button id="share-btn" class="react-box">
                <img  id=${e.id}
                      width="20px"
                      height="20px" 
                      src="./image/share-from-square-regular.svg" 
                      alt="share"/>Share
              </button>
                <button id="apply" class="react-box">
                  <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".work-section2").appendChild(community_posts);
      })

      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const applycollection = document.querySelectorAll("#apply")
      const arr5 = Array.prototype.slice.call(applycollection);
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }

      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })


      arr5.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {
          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            volunteer_form.name.value = `${localStorage.getItem("displayName")}`
            volunteer_form.email.value = `${localStorage.getItem("email")}`
            post_id_apply = elmnt.children[0].id
            blurr.style.display = "block"
            apply_tab.style.display = "block"
          }

        })
      })

      if(CV_input){
        CV_input.addEventListener("input",function() {
          const reader = new FileReader()
          reader.readAsDataURL(this.files[0])
        })
      }

      if(apply_btn){
        apply_btn.addEventListener("click", (e) => {
          e.preventDefault()
          loading.style.display = "block"

          const file =  volunteer_form.CV.files[0]
          const mediaRef = ref(storage, `media/${ v4() }`);
          let mediaURL = ""

        uploadBytes(mediaRef, file)
        .then( () => {
          console.log("image uploaded")
          getDownloadURL(mediaRef).then( (url) =>{
            mediaURL = url
    
            addDoc(formsRef, {
              name: volunteer_form.name.value,
              email: volunteer_form.email.value,
              phone: volunteer_form.phone.value,
              address: volunteer_form.address.value,
              DOB: volunteer_form.date.value,
              CV: mediaURL,
              createdAT: serverTimestamp(),
              createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
              type: "work",
              user_id: localStorage.getItem("userID"),
              post_id: post_id_apply
            })
            .then( () => {
              post_id_apply = ""
              loading.style.display = "none"
              apply_tab.style.display = "none"
              blurr.style.display = "none"
              volunteer_form.reset()
            })
            .catch( (error) => {
              console.log(error)
            })


          })
        })          
          
        })
      }

      if(cancel_apply_btn){
        cancel_apply_btn.addEventListener("click", () => {
          volunteer_form.reset()
          post_id_apply = ""
          apply_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


     })
     .catch(err => {
      console.log(err.message)
      })

    getDocs(q3)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                <button id="apply" class="react-box">
                  <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".work-section2").appendChild(community_posts);
      })

      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const applycollection = document.querySelectorAll("#apply")
      const arr5 = Array.prototype.slice.call(applycollection);

      const profilecollection = document.querySelectorAll(".user_profile_pic")
      const arr6 = Array.prototype.slice.call(profilecollection);

      const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
          alert("link copied")
        })

      })

      arr6.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {

          localStorage.setItem("other_user", `${elmnt.id}`)
          location.href = "Profile2.html"
        })

      })
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {
          
          const docRef = doc(db, "posts", elmnt.children[0].id)

          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_text2.value = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })

      arr5.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {
          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            volunteer_form.name.value = `${localStorage.getItem("displayName")}`
            volunteer_form.email.value = `${localStorage.getItem("email")}`
            post_id_apply = elmnt.children[0].id
            blurr.style.display = "block"
            apply_tab.style.display = "block"
          }

        })
      })

      if(apply_btn){
        apply_btn.addEventListener("click", (e) => {
          e.preventDefault()
          loading.style.display = "block"

          const file =  volunteer_form.CV.files[0]
          const mediaRef = ref(storage, `media/${ v4() }`);
          let mediaURL = ""

        uploadBytes(mediaRef, file)
        .then( () => {
          console.log("image uploaded")
          getDownloadURL(mediaRef).then( (url) =>{
            mediaURL = url
    
            addDoc(formsRef, {
              name: volunteer_form.name.value,
              email: volunteer_form.email.value,
              phone: volunteer_form.phone.value,
              address: volunteer_form.address.value,
              DOB: volunteer_form.date.value,
              CV: mediaURL,
              createdAT: serverTimestamp(),
              createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
              type: "work",
              user_id: localStorage.getItem("userID"),
              post_id: post_id_apply
            })
            .then( () => {
              post_id_apply = ""
              loading.style.display = "none"
              apply_tab.style.display = "none"
              blurr.style.display = "none"
              volunteer_form.reset()
            })
            .catch( (error) => {
              console.log(error)
            })


          })
        })      
          
          
        })
      }

      if(cancel_apply_btn){
        cancel_apply_btn.addEventListener("click", () => {
          volunteer_form.reset()
          post_id_apply = ""
          apply_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


     })
     .catch(err => {
      console.log(err.message)
      })

  }
}


//////////////////////////////////////////////////////////////////////////////





// displaying posts in volunteer page ////////////////////////////////////////


const volunteer_page_id = document.querySelector(".volunteer-section2")

// const comment_tab = document.querySelector(".make_comment_tab")
// const comment_text2 = document.querySelector(".comment_text2")
// const make_comment_btn = document.querySelector(".make_comment_btn")
// const make_comment_cancel = document.querySelector(".make_comment_cancel")
// const loading = document.querySelector(".loading")

const apply_tab = document.querySelector(".apply_tab")
const volunteer_form = document.getElementById("voluunteerForm")
const apply_btn = document.querySelector(".apply_btn")
const cancel_apply_btn = document.querySelector(".cancel_apply_btn")

let post_id_apply = ""


if(volunteer_page_id) {

  let most_liked = localStorage.getItem("most_liked")? localStorage.getItem("most_liked").toLowerCase().split(",") : ["0","0","0","0","0","0"]
  const q = query(postRef, where("type", "==", "volunteer"), orderBy("createdAT", "desc"))
  const q2 = query(postRef, and(where("type", "==", "volunteer"), where("tag", "in", most_liked)), orderBy("createdAT", "desc")  )
  const q3 = query(postRef, and(where("type", "==", "volunteer"), where("tag", "not-in", most_liked)), orderBy("createdAT", "desc")  )
  
  let posts = []
  //123


  if(filter_btn){
    filter_btn.addEventListener("click", () => {

      if(filter.value == "Username" && filter_input.value != ""){

        const userq = query(postRef, and(where("type", "==", "volunteer"), where("user_display_name", ">=", `${filter_input.value}`), where("user_display_name", "<=", `${filter_input.value}` + "\uf8ff")), orderBy("createdAT", "desc")  ) 
        console.log("Looking for user")
        loading.style.display = "block"

        getDocs(userq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          volunteer_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    <button id="apply" class="react-box">
                      <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".volunteer-section2").appendChild(community_posts);
          })
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);
    
          const applycollection = document.querySelectorAll("#apply")
          const arr5 = Array.prototype.slice.call(applycollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
    
          arr5.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                volunteer_form.email.value = `${localStorage.getItem("email")}`
                post_id_apply = elmnt.children[0].id
                blurr.style.display = "block"
                apply_tab.style.display = "block"
              }
    
            })
          })
    
          if(apply_btn){
            apply_btn.addEventListener("click", (e) => {
              e.preventDefault()
              loading.style.display = "block"
    
              addDoc(formsRef, {
                name: volunteer_form.name.value,
                email: volunteer_form.email.value,
                phone: volunteer_form.phone.value,
                DOB: volunteer_form.date.value,
                emergency: volunteer_form.emergency.value,
                createdAT: serverTimestamp(),
                createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                type: "volunteer",
                user_id: localStorage.getItem("userID"),
                post_id: post_id_apply,
              })
              .then( () => {
                post_id_apply = ""
                loading.style.display = "none"
                apply_tab.style.display = "none"
                blurr.style.display = "none"
                volunteer_form.reset()
              })
              .catch( (error) => {
                console.log(error)
              })
              
              
              
            })
          }
    
          if(cancel_apply_btn){
            cancel_apply_btn.addEventListener("click", () => {
              volunteer_form.reset()
              post_id_apply = ""
              apply_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
         })
        .catch(err => {
        console.log(err.message)
        })

      }
      else if(filter.value == "Description" && filter_input.value != ""){

        const filterValue = filter_input.value.toLowerCase().trim()
        filter_input.value = filterValue
        const descq = query(postRef, and(where("type", "==", "volunteer"), where("description", ">=", `${filter_input.value}`), where("description", "<=", `${filter_input.value}` + "\uf8ff")), orderBy("createdAT", "desc")  ) 

        console.log("looking for desc")
        loading.style.display = "block"   

        getDocs(descq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          volunteer_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    <button id="apply" class="react-box">
                      <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".volunteer-section2").appendChild(community_posts);
          })
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);
    
          const applycollection = document.querySelectorAll("#apply")
          const arr5 = Array.prototype.slice.call(applycollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
    
          arr5.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                volunteer_form.email.value = `${localStorage.getItem("email")}`
                post_id_apply = elmnt.children[0].id
                blurr.style.display = "block"
                apply_tab.style.display = "block"
              }
    
            })
          })
    
          if(apply_btn){
            apply_btn.addEventListener("click", (e) => {
              e.preventDefault()
              loading.style.display = "block"
    
              addDoc(formsRef, {
                name: volunteer_form.name.value,
                email: volunteer_form.email.value,
                phone: volunteer_form.phone.value,
                DOB: volunteer_form.date.value,
                emergency: volunteer_form.emergency.value,
                createdAT: serverTimestamp(),
                createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                type: "volunteer",
                user_id: localStorage.getItem("userID"),
                post_id: post_id_apply,
              })
              .then( () => {
                post_id_apply = ""
                loading.style.display = "none"
                apply_tab.style.display = "none"
                blurr.style.display = "none"
                volunteer_form.reset()
              })
              .catch( (error) => {
                console.log(error)
              })
              
              
              
            })
          }
    
          if(cancel_apply_btn){
            cancel_apply_btn.addEventListener("click", () => {
              volunteer_form.reset()
              post_id_apply = ""
              apply_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
         })
        .catch(err => {
        console.log(err.message)
        })

      }
      else if(filter.value == "Tag" && filter_input.value != ""){

        const filterValue = filter_input.value.toLowerCase().trim()
        filter_input.value = filterValue
        const tagq = query(postRef, and(where("type", "==", "volunteer"), where("tag", ">=", `${filter_input.value}`), where("tag", "<=", `${filter_input.value}` + "\uf8ff")),orderBy("createdAT", "desc")  ) 

        console.log("looking for tag")
        loading.style.display = "block"

        getDocs(tagq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          volunteer_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    <button id="apply" class="react-box">
                      <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".volunteer-section2").appendChild(community_posts);
          })
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);
    
          const applycollection = document.querySelectorAll("#apply")
          const arr5 = Array.prototype.slice.call(applycollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
    
          arr5.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                volunteer_form.email.value = `${localStorage.getItem("email")}`
                post_id_apply = elmnt.children[0].id
                blurr.style.display = "block"
                apply_tab.style.display = "block"
              }
    
            })
          })
    
          if(apply_btn){
            apply_btn.addEventListener("click", (e) => {
              e.preventDefault()
              loading.style.display = "block"
    
              addDoc(formsRef, {
                name: volunteer_form.name.value,
                email: volunteer_form.email.value,
                phone: volunteer_form.phone.value,
                DOB: volunteer_form.date.value,
                emergency: volunteer_form.emergency.value,
                createdAT: serverTimestamp(),
                createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                type: "volunteer",
                user_id: localStorage.getItem("userID"),
                post_id: post_id_apply,
              })
              .then( () => {
                post_id_apply = ""
                loading.style.display = "none"
                apply_tab.style.display = "none"
                blurr.style.display = "none"
                volunteer_form.reset()
              })
              .catch( (error) => {
                console.log(error)
              })
              
              
              
            })
          }
    
          if(cancel_apply_btn){
            cancel_apply_btn.addEventListener("click", () => {
              volunteer_form.reset()
              post_id_apply = ""
              apply_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
         })
        .catch(err => {
        console.log(err.message)
        })

      }
      else if(filter.value == "Recommended"){

        if(most_liked[1] == "0" && most_liked[3] == "0" && most_liked[5] == "0"){
          getDocs(q)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
            
            loading.style.display = "none"
            volunteer_page_id.innerHTML = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                      <button id="apply" class="react-box">
                        <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                      </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".volunteer-section2").appendChild(community_posts);
            })
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);
      
            const applycollection = document.querySelectorAll("#apply")
            const arr5 = Array.prototype.slice.call(applycollection);

            const sharecollection = document.querySelectorAll("#share-btn")
            const arr7 = Array.prototype.slice.call(sharecollection);
      
            arr7.forEach( (elmnt) => {
      
              elmnt.addEventListener("click", () => {
      
                copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
                alert("link copied")
              })
      
            })
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
      
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
      
            arr5.forEach( (elmnt) => {
              elmnt.addEventListener("click", () => {
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                  volunteer_form.email.value = `${localStorage.getItem("email")}`
                  post_id_apply = elmnt.children[0].id
                  blurr.style.display = "block"
                  apply_tab.style.display = "block"
                }
      
              })
            })
      
            if(apply_btn){
              apply_btn.addEventListener("click", (e) => {
                e.preventDefault()
                loading.style.display = "block"
      
                addDoc(formsRef, {
                  name: volunteer_form.name.value,
                  email: volunteer_form.email.value,
                  phone: volunteer_form.phone.value,
                  DOB: volunteer_form.date.value,
                  emergency: volunteer_form.emergency.value,
                  createdAT: serverTimestamp(),
                  createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                  type: "volunteer",
                  user_id: localStorage.getItem("userID"),
                  post_id: post_id_apply,
                })
                .then( () => {
                  post_id_apply = ""
                  loading.style.display = "none"
                  apply_tab.style.display = "none"
                  blurr.style.display = "none"
                  volunteer_form.reset()
                })
                .catch( (error) => {
                  console.log(error)
                })
                
                
                
              })
            }
      
            if(cancel_apply_btn){
              cancel_apply_btn.addEventListener("click", () => {
                volunteer_form.reset()
                post_id_apply = ""
                apply_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
           })
          .catch(err => {
          console.log(err.message)
          })
        
        }
        else{
          getDocs(q2)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
            
            loading.style.display = "none"
            volunteer_page_id.innerHTML = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                      <button id="apply" class="react-box">
                        <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                      </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".volunteer-section2").appendChild(community_posts);
            })
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);
      
            const applycollection = document.querySelectorAll("#apply")
            const arr5 = Array.prototype.slice.call(applycollection);
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
      
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
      
            arr5.forEach( (elmnt) => {
              elmnt.addEventListener("click", () => {
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                  volunteer_form.email.value = `${localStorage.getItem("email")}`
                  post_id_apply = elmnt.children[0].id
                  blurr.style.display = "block"
                  apply_tab.style.display = "block"
                }
      
              })
            })
      
            if(apply_btn){
              apply_btn.addEventListener("click", (e) => {
                e.preventDefault()
                loading.style.display = "block"
      
                addDoc(formsRef, {
                  name: volunteer_form.name.value,
                  email: volunteer_form.email.value,
                  phone: volunteer_form.phone.value,
                  DOB: volunteer_form.date.value,
                  emergency: volunteer_form.emergency.value,
                  createdAT: serverTimestamp(),
                  createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                  type: "volunteer",
                  user_id: localStorage.getItem("userID"),
                  post_id: post_id_apply,
                })
                .then( () => {
                  post_id_apply = ""
                  loading.style.display = "none"
                  apply_tab.style.display = "none"
                  blurr.style.display = "none"
                  volunteer_form.reset()
                })
                .catch( (error) => {
                  console.log(error)
                })
                
                
                
              })
            }
      
            if(cancel_apply_btn){
              cancel_apply_btn.addEventListener("click", () => {
                volunteer_form.reset()
                post_id_apply = ""
                apply_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
           })
          .catch(err => {
          console.log(err.message)
          })
      
          getDocs(q3)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
            
            loading.style.display = "none"
            volunteer_page_id.innerHTML = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                      <button id="apply" class="react-box">
                        <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                      </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".volunteer-section2").appendChild(community_posts);
            })
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);
      
            const applycollection = document.querySelectorAll("#apply")
            const arr5 = Array.prototype.slice.call(applycollection);

            const sharecollection = document.querySelectorAll("#share-btn")
            const arr7 = Array.prototype.slice.call(sharecollection);
      
            arr7.forEach( (elmnt) => {
      
              elmnt.addEventListener("click", () => {
      
                copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
                alert("link copied")
              })
      
            })
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
      
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
      
            arr5.forEach( (elmnt) => {
              elmnt.addEventListener("click", () => {
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                  volunteer_form.email.value = `${localStorage.getItem("email")}`
                  post_id_apply = elmnt.children[0].id
                  blurr.style.display = "block"
                  apply_tab.style.display = "block"
                }
      
              })
            })
      
            if(apply_btn){
              apply_btn.addEventListener("click", (e) => {
                e.preventDefault()
                loading.style.display = "block"
      
                addDoc(formsRef, {
                  name: volunteer_form.name.value,
                  email: volunteer_form.email.value,
                  phone: volunteer_form.phone.value,
                  DOB: volunteer_form.date.value,
                  emergency: volunteer_form.emergency.value,
                  createdAT: serverTimestamp(),
                  createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                  type: "volunteer",
                  user_id: localStorage.getItem("userID"),
                  post_id: post_id_apply,
                })
                .then( () => {
                  post_id_apply = ""
                  loading.style.display = "none"
                  apply_tab.style.display = "none"
                  blurr.style.display = "none"
                  volunteer_form.reset()
                })
                .catch( (error) => {
                  console.log(error)
                })
                
                
                
              })
            }
      
            if(cancel_apply_btn){
              cancel_apply_btn.addEventListener("click", () => {
                volunteer_form.reset()
                post_id_apply = ""
                apply_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
           })
          .catch(err => {
          console.log(err.message)
          })
      
        }


      }
      else if(filter.value == "Date"){

        const dateq = query(postRef, where("type", "==", "volunteer"), orderBy("createdAT", "desc")  ) 

        loading.style.display = "block"

        getDocs(dateq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          volunteer_page_id.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
          ${e.textonly? 
            `<textarea disabled class="description" style="margin-bottom: 0; height: 226px;width: 100%;background-color: #00000000;border: 0px;resize: none;font-size: x-large;white-space: break-spaces; text-wrap: auto; overflow: scroll;">${e.description}</textarea>`
            :` 
            <p class="description">${e.description}</p>
            <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
          `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                  <button id="share-btn" class="react-box">
                    <img  id=${e.id}
                          width="20px"
                          height="20px" 
                          src="./image/share-from-square-regular.svg" 
                          alt="share"/>Share
                  </button>
                    <button id="apply" class="react-box">
                      <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".volunteer-section2").appendChild(community_posts);
          })
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);
    
          const applycollection = document.querySelectorAll("#apply")
          const arr5 = Array.prototype.slice.call(applycollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
    
          arr5.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                volunteer_form.name.value = `${localStorage.getItem("displayName")}`
                volunteer_form.email.value = `${localStorage.getItem("email")}`
                post_id_apply = elmnt.children[0].id
                blurr.style.display = "block"
                apply_tab.style.display = "block"
              }
    
            })
          })
    
          if(apply_btn){
            apply_btn.addEventListener("click", (e) => {
              e.preventDefault()
              loading.style.display = "block"
    
              addDoc(formsRef, {
                name: volunteer_form.name.value,
                email: volunteer_form.email.value,
                phone: volunteer_form.phone.value,
                DOB: volunteer_form.date.value,
                emergency: volunteer_form.emergency.value,
                createdAT: serverTimestamp(),
                createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
                type: "volunteer",
                user_id: localStorage.getItem("userID"),
                post_id: post_id_apply,
              })
              .then( () => {
                post_id_apply = ""
                loading.style.display = "none"
                apply_tab.style.display = "none"
                blurr.style.display = "none"
                volunteer_form.reset()
              })
              .catch( (error) => {
                console.log(error)
              })
              
              
              
            })
          }
    
          if(cancel_apply_btn){
            cancel_apply_btn.addEventListener("click", () => {
              volunteer_form.reset()
              post_id_apply = ""
              apply_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
         })
        .catch(err => {
        console.log(err.message)
        })


      }

    })
  }


  if(most_liked[1] == "0" && most_liked[3] == "0" && most_liked[5] == "0"){
    getDocs(q)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      if(document.querySelector(".main2")){
        document.querySelector(".main2").style.display = "none"
      }
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                <button id="apply" class="react-box">
                  <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".volunteer-section2").appendChild(community_posts);
      })

      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const applycollection = document.querySelectorAll("#apply")
      const arr5 = Array.prototype.slice.call(applycollection);

      const profilecollection = document.querySelectorAll(".user_profile_pic")
      const arr6 = Array.prototype.slice.call(profilecollection);

      const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
          alert("link copied")
        })

      })

      arr6.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {

          localStorage.setItem("other_user", `${elmnt.id}`)
          location.href = "Profile2.html"
        })

      })
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }

      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })


      arr5.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {
          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            volunteer_form.name.value = `${localStorage.getItem("displayName")}`
            volunteer_form.email.value = `${localStorage.getItem("email")}`
            post_id_apply = elmnt.children[0].id
            blurr.style.display = "block"
            apply_tab.style.display = "block"
          }

        })
      })

      if(apply_btn){
        apply_btn.addEventListener("click", (e) => {
          e.preventDefault()
          loading.style.display = "block"

          addDoc(formsRef, {
            name: volunteer_form.name.value,
            email: volunteer_form.email.value,
            phone: volunteer_form.phone.value,
            DOB: volunteer_form.date.value,
            emergency: volunteer_form.emergency.value,
            createdAT: serverTimestamp(),
            createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
            type: "volunteer",
            user_id: localStorage.getItem("userID"),
            post_id: post_id_apply,
          })
          .then( () => {
            post_id_apply = ""
            loading.style.display = "none"
            apply_tab.style.display = "none"
            blurr.style.display = "none"
            volunteer_form.reset()
          })
          .catch( (error) => {
            console.log(error)
          })
          
          
          
        })
      }

      if(cancel_apply_btn){
        cancel_apply_btn.addEventListener("click", () => {
          volunteer_form.reset()
          post_id_apply = ""
          apply_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


     })
    .catch(err => {
    console.log(err.message)
    })
  
  }
  else{
    getDocs(q2)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      if(document.querySelector(".main2")){
        document.querySelector(".main2").style.display = "none"
      }
      
      loading.style.display = "none"
      volunteer_page_id.innerHTML = ""
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
      ${e.textonly? 
        `<textarea disabled class="description" style="margin-bottom: 0; height: 226px;width: 100%;background-color: #00000000;border: 0px;resize: none;font-size: x-large;white-space: break-spaces; text-wrap: auto; overflow: scroll;">${e.description}</textarea>`
        :` 
        <p class="description">${e.description}</p>
        <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
      `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
              <button id="share-btn" class="react-box">
                <img  id=${e.id}
                      width="20px"
                      height="20px" 
                      src="./image/share-from-square-regular.svg" 
                      alt="share"/>Share
              </button>
                <button id="apply" class="react-box">
                  <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".volunteer-section2").appendChild(community_posts);
      })

      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const applycollection = document.querySelectorAll("#apply")
      const arr5 = Array.prototype.slice.call(applycollection);
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }

      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })


      arr5.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {
          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            volunteer_form.name.value = `${localStorage.getItem("displayName")}`
            volunteer_form.email.value = `${localStorage.getItem("email")}`
            post_id_apply = elmnt.children[0].id
            blurr.style.display = "block"
            apply_tab.style.display = "block"
          }

        })
      })

      if(apply_btn){
        apply_btn.addEventListener("click", (e) => {
          e.preventDefault()
          loading.style.display = "block"

          addDoc(formsRef, {
            name: volunteer_form.name.value,
            email: volunteer_form.email.value,
            phone: volunteer_form.phone.value,
            DOB: volunteer_form.date.value,
            emergency: volunteer_form.emergency.value,
            createdAT: serverTimestamp(),
            createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
            type: "volunteer",
            user_id: localStorage.getItem("userID"),
            post_id: post_id_apply,
          })
          .then( () => {
            post_id_apply = ""
            loading.style.display = "none"
            apply_tab.style.display = "none"
            blurr.style.display = "none"
            volunteer_form.reset()
          })
          .catch( (error) => {
            console.log(error)
          })
          
          
          
        })
      }

      if(cancel_apply_btn){
        cancel_apply_btn.addEventListener("click", () => {
          volunteer_form.reset()
          post_id_apply = ""
          apply_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


     })
    .catch(err => {
    console.log(err.message)
    })

    getDocs(q3)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })
      
      loading.style.display = "none"
      volunteer_page_id.innerHTML = ""
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
      ${e.textonly? 
        `<textarea disabled class="description" style="margin-bottom: 0; height: 226px;width: 100%;background-color: #00000000;border: 0px;resize: none;font-size: x-large;white-space: break-spaces; text-wrap: auto; overflow: scroll;">${e.description}</textarea>`
        :` 
        <p class="description">${e.description}</p>
        <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
      `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
              <button id="share-btn" class="react-box">
                <img  id=${e.id}
                      width="20px"
                      height="20px" 
                      src="./image/share-from-square-regular.svg" 
                      alt="share"/>Share
              </button>
                <button id="apply" class="react-box">
                  <img id=${e.id} width="22px" height="22px" src="./image/form.png" alt="share"/>Apply
                </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".volunteer-section2").appendChild(community_posts);
      })

      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const applycollection = document.querySelectorAll("#apply")
      const arr5 = Array.prototype.slice.call(applycollection);

      const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
          alert("link copied")
        })

      })
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }

      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })


      arr5.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {
          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            volunteer_form.name.value = `${localStorage.getItem("displayName")}`
            volunteer_form.email.value = `${localStorage.getItem("email")}`
            post_id_apply = elmnt.children[0].id
            blurr.style.display = "block"
            apply_tab.style.display = "block"
          }

        })
      })

      if(apply_btn){
        apply_btn.addEventListener("click", (e) => {
          e.preventDefault()
          loading.style.display = "block"

          addDoc(formsRef, {
            name: volunteer_form.name.value,
            email: volunteer_form.email.value,
            phone: volunteer_form.phone.value,
            DOB: volunteer_form.date.value,
            emergency: volunteer_form.emergency.value,
            createdAT: serverTimestamp(),
            createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
            type: "volunteer",
            user_id: localStorage.getItem("userID"),
            post_id: post_id_apply,
          })
          .then( () => {
            post_id_apply = ""
            loading.style.display = "none"
            apply_tab.style.display = "none"
            blurr.style.display = "none"
            volunteer_form.reset()
          })
          .catch( (error) => {
            console.log(error)
          })
          
          
          
        })
      }

      if(cancel_apply_btn){
        cancel_apply_btn.addEventListener("click", () => {
          volunteer_form.reset()
          post_id_apply = ""
          apply_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


     })
    .catch(err => {
    console.log(err.message)
    })

  }
}


//////////////////////////////////////////////////////////////////////////////




// displaying posts in forms page ////////////////////////////////////////////

const forms_page_id = document.querySelector(".forms-section2")
const slider_container = document.querySelector(".slider-container")
const slider = document.querySelector(".slider")
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const exit_btn = document.querySelector("#exit-btn")

function updateSlider() {
  slider.style.transform = `translateX(${-index * 100}%)`;
}

let totalCards = 0
let index = 0

if(forms_page_id) {

  const q = query(postRef, and( or( where("type", "==", "volunteer"), where("type", "==", "work")), where("user_id", "==", `${localStorage.getItem("userID")}`) ), orderBy("createdAT", "desc"))
  
  let posts = []

  if(!localStorage.getItem("userID")){
    blurr.style.display = "block"
    const text = "you are currently in guest mode if you want to check the website features please log in"
    if (confirm(text) == true) {
      location.href = "login.html"
    } 
  }

    getDocs(q)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      document.querySelector(".main2").style.display = "none"
      
      let community_posts = null

      posts.forEach( (e) => {
        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard" id=${e.id}>
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                <p>${e.user_display_name}</p>
                <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>
              ${e.textonly? 
              `<label class="text-only-description" >${e.description}</label>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
            </div>

          </div>
      `);
      document.querySelector(".forms-section2").appendChild(community_posts);
      })


      const postcollection = document.querySelectorAll(".postcard")
      const arr = Array.prototype.slice.call(postcollection);

      arr.forEach( (post) =>{
        post.addEventListener("click",() =>{

          const q = query(formsRef, where("post_id", "==", `${post.id}`))

          getDocs(q)
          .then( (snapshot) => {
            let forms = []
            snapshot.docs.forEach((doc) => {
              forms.push({...doc.data(), id: doc.id})
            })

            let form = null
            slider.innerHTML = null

            forms.forEach( (e) =>{
              if(e.type == "work"){
                form = createPosts(`
                  <div class="card">
                      <h2>Work Form</h2>
                      <p><strong>Full Name: </strong> ${e.name}</p>
                      <p><strong>Email: </strong> ${e.email}</p>
                      <p><strong>Phone: </strong> ${e.phone}</p>
                      <p><strong>Address: </strong> ${e.address}</p>
                      <p><strong>Date of birth:</strong> ${e.DOB}</p>
                      <p><strong>CV: </strong><a target="_blank" href="${e.CV}"> CV link </a></p>
                  </div>
                  `)
              }
              else{
                form = createPosts(`
                  <div class="card">
                    <h2>Volunteer Form</h2>
                    <p><strong>Full Name: </strong>${e.name} </p>
                    <p><strong>Email: </strong> ${e.email}</p>
                    <p><strong>Phone: </strong> ${e.phone}</p>
                    <p><strong>Date of birth: </strong> ${e.DOB}</p>
                    <p><strong>Emergency Contact: </strong> ${e.emergency}</p>
                  </div>
                  `)
              }
                slider.appendChild(form);
            })

            slider_container.style.display = "flex"
            blurr.style.display = "block" 
          })
          
        })

      })

      if(exit_btn){
        exit_btn.addEventListener("click", () => {
          slider.innerHTML = null
          slider_container.style.display = "none"
          blurr.style.display = "none"
        })
      }

      if(nextBtn){
        nextBtn.addEventListener('click', () => {
          totalCards = document.querySelectorAll('.card').length-1
          console.log(totalCards)
          console.log(index)
          if (index < totalCards ) {
              index++;
              updateSlider()
          }
      })
      if(prevBtn){
        prevBtn.addEventListener('click', () => {
          if (index > 0) {
              index--;
              updateSlider()
          }
      });
      }
      }



     })
    .catch(err => {
    console.log(err.message)
    })

}


//////////////////////////////////////////////////////////////////////////////

// displaying profile page 2 ////////////////////////////////////////////////////////////

const profile_page_id2 = document.getElementById("profile_page2")
const shar_profile_page = document.querySelector(".share-profile-page")

if(profile_page_id2 && !shar_profile_page) {

  document.querySelector(".profile-page2").id = localStorage.getItem("other_user")

  const username = document.querySelector(".username")
  const profile_pic2 = document.querySelector(".profile-pic2")
  const profile_name = document.querySelector(".profile-name")
  const description = document.querySelector(".description")

  const q = doc(db, "users", localStorage.getItem("other_user")) 
  const q2 = doc(db, "companies", localStorage.getItem("other_user"))

  getDoc(q)
    .then( (user) => {
      username.innerHTML = user.data().display_name
      profile_pic2.src = user.data().profile_pic
      profile_name.innerHTML = user.data().first_name + " " + user.data().last_name
      description.innerHTML = user.data().description
    })
    .catch( () => {
      getDoc(q2)
      .then( (user) => {
        username.innerHTML = `${user.data().display_name} - ${user.data().location}` 
        profile_pic2.src = user.data().profile_pic
        profile_name.innerHTML = user.data().name
        description.innerHTML = user.data().description
      })
      .catch( (error) => {
        console.log(error)
      })
    })


  const profile_page_q = query(postRef, where("user_id", "==", localStorage.getItem("other_user")), orderBy("createdAT", "desc") )

  onSnapshot(profile_page_q, (snapshot) => {
    let profile_posts = []
    snapshot.docs.forEach( (doc) => {
      profile_posts.push({...doc.data(), id:doc.id})
    })

    postsN.childNodes[0].data = `${profile_posts.length}`
    document.getElementById("main").innerHTML = "";

    let profile_posts2 = null

    profile_posts.forEach( (e) => {

      let liked = false
    
      for(const i in e.likes){
        if(e.likes[i] == localStorage.getItem("userID")){
          liked = true
        }
      }

      let x = document.querySelector(".profile-pic-container").children[0].src

      if(e.profile_pic != x){
        const docRef = doc(db, "posts", e.id)
        updateDoc(docRef, {
          profile_pic: `${x}`
        })
      }

      profile_posts2 = createPosts(`
          <div class="postcard" id=${e.id} >
            <div class="user-name">
              <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                    <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
            </div>  
            ${e.textonly? 
              `<textarea disabled class="description" style="margin-bottom: 0; height: 258.5px;width: 100%;background-color: #00000000;border: 0px;resize: none;font-size: x-large;white-space: break-spaces; text-wrap: auto; overflow: scroll;">${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
              `}
              <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>

                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>

                  </div>
          </div>
      `);
      document.getElementById("main").appendChild(profile_posts2);
    })
    
    const likecollection = document.querySelectorAll("#like")
    const arr = Array.prototype.slice.call(likecollection);

    const commentcollection = document.querySelectorAll("#comment-btn")
    const arr2 = Array.prototype.slice.call(commentcollection);

    const commentcollection2 = document.querySelectorAll(".comments")
    const arr3 = Array.prototype.slice.call(commentcollection2);

    const postcollection = document.querySelectorAll(".post_media")
    const arr4 = Array.prototype.slice.call(postcollection);

    const profilecollection = document.querySelectorAll(".user_profile_pic")
    const arr6 = Array.prototype.slice.call(profilecollection);

    const sharecollection = document.querySelectorAll("#share-btn")
    const arr7 = Array.prototype.slice.call(sharecollection);

    arr7.forEach( (elmnt) => {

      elmnt.addEventListener("click", () => {

        copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
        alert("link copied")
      })

    })

    arr6.forEach( (elmnt) => {
      elmnt.addEventListener("click", () => {

        localStorage.setItem("other_user", `${elmnt.id}`)
        location.href = "Profile2.html"
      })

    })
  
    arr.forEach((elmnt) => {
      elmnt.addEventListener("click", () => {

        if(!localStorage.getItem("userID")){

          const text = "you are currently in guest mode if you want to check the website features please log in"
          if (confirm(text) == true) {
            location.href = "login.html"
          }
        }
        
        const docRef = doc(db, "posts", elmnt.children[0].id)
        const userRef = doc(db, "users", localStorage.getItem("userID"))

        getDoc(docRef)
          .then((post) => {

            if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
              
              elmnt.children[0].src = "../dist/image/heart2.png"
              elmnt.children[0].height = "17"
              elmnt.disabled = true

              const arr = post.data().likes
              arr.push(`${localStorage.getItem("userID")}`)

              updateDoc(docRef , {
                likes: arr
              })
              .then( () => {
                getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
              })
            }
            else{
              elmnt.children[0].src = "../dist/image/heart-regular.svg"
              elmnt.children[0].height = "20"
              elmnt.disabled = true

              const updatePostRef = doc(db, "posts", post.id)
              const arr = post.data().likes
              arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

              updateDoc(updatePostRef , {
                likes: arr
              })
              .then( () => {
                getDoc(userRef)
                .then( (user) => {

                  const interests = new Map(Object.entries(user.data().Interests));
                  interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                  const interests2 = Object.fromEntries(interests);

                  updateDoc(userRef, {
                    Interests: interests2
                  })
                })
                elmnt.disabled = false
              })
            }
          })

        })

    })

    arr2.forEach((elmnt) => {
      elmnt.addEventListener("click", () => {

        if(!localStorage.getItem("userID")){

          const text = "you are currently in guest mode if you want to check the website features please log in"
          if (confirm(text) == true) {
            location.href = "login.html"
          }
        }
        else{
          post_id_comment = elmnt.children[0].id
          blurr.style.display = "block"
          comment_tab.style.display = "block"
          }
      })
    })
  
    if(make_comment_btn){
      make_comment_btn.addEventListener("click", () =>{
  
        if(comment_text2.value != ""){
          loading.style.display = "block"
          addDoc(commentRef,{
            comment: comment_text2.value,
            createdAT: serverTimestamp(),
            post_id: post_id_comment,
            user_id: localStorage.getItem("userID"),
            user_pic: localStorage.getItem("profile_pic"),
            username: localStorage.getItem("displayName")
          })
          .then( () => {
            post_id_comment = ""
            comment_text2.value = ""
            loading.style.display = "none"
            comment_tab.style.display = "none"
            blurr.style.display = "none"
          })
        }
      })    
    }
  
    if(make_comment_cancel){
      make_comment_cancel.addEventListener("click", () => {
        post_id_comment = ""
        comment_tab.style.display = "none"
        blurr.style.display = "none"
      })
    }


    arr3.forEach((elmnt) => {
      const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

      onSnapshot(q, (snapshot) => {
        let allcomments = []
        snapshot.docs.forEach( (doc) => {
          allcomments.push({...doc.data(), id:doc.id})
        })

        elmnt.innerHTML = null
        let commentElmnt = null
        let commentFound = false

        if(allcomments.length != 0){
          commentFound = true
          allcomments.forEach( (comment) =>{
          commentElmnt = createPosts(`

            <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
              <img src= ${comment.user_pic}  alt="Profile logo" />
              <div>
                <p class="comment_name"> ${comment.username} </p>
                <p class="comment_text"> ${comment.comment} </p>
              </div>
            </div>
            `)
            elmnt.appendChild(commentElmnt);
        })          
      }
      else{
        commentElmnt = createPosts(`

          <div class="no_comments">
              <h2>No comments</h2>
          </div>
          `)
        elmnt.appendChild(commentElmnt);
      }
      })
    })

    arr4.forEach( (post) => {
      post.addEventListener("click", () => {

        const q = doc(db, "posts", post.id)
        const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

        const bigger_post = document.querySelector(".main3")
        const bigger_post_no_comments = document.getElementById("no_comments2")
        const bigger_post_comments = document.getElementById("comments2")
        const close_btn = document.querySelector(".close_btn")
        let allcomments = []

        if(close_btn){
          close_btn.addEventListener("click", () => {
            bigger_post.style.display = "none"

            bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
            bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
            bigger_post.children[0].children[1].innerHTML = "..."
            bigger_post.children[0].children[2].src = "./image/loading.gif"
            bigger_post.children[0].children[3].src = "./image/loading.gif"
            bigger_post.children[0].children[2].style.display = "block"
            bigger_post.children[0].children[3].style.display = "none"

            bigger_post_comments.innerHTML = `
              <div class="no_comments" id="no_comments2" >
                <h2>No comments</h2>
              </div>
            `
          })
        }

        bigger_post.style.display = "flex block"

        getDoc(q)
          .then( (post2) => {
            if(post2.data().video){
              bigger_post.children[0].children[2].style.display = "none"
              bigger_post.children[0].children[3].style.display = "block"
              bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
              bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
              bigger_post.children[0].children[1].innerHTML = post2.data().description
              bigger_post.children[0].children[3].src = post2.data().media
            }
            else{
              bigger_post.children[0].children[3].style.display = "none"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
              bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
              bigger_post.children[0].children[1].innerHTML = post2.data().description
              bigger_post.children[0].children[2].src = post2.data().media
            }
          })
          getDocs(q2)
            .then( (snapshot) => {
              snapshot.docs.forEach((doc) => {
                allcomments.push({...doc.data(), id: doc.id})
              })

              let commentElmnt = null

              if(allcomments.length != 0){
                bigger_post_no_comments.style.display = "none"
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display:'flex block';" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name3"> ${comment.username} </p>
                      <p class="comment_text3"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  bigger_post_comments.appendChild(commentElmnt);
              })          
            }

            })
        
      })
    })



  })


  //Deleting posts//////////////////////////////////////////////////////////////
  if(delete_cancel){
    delete_cancel.addEventListener("click", (e) => {

      blurr.style.display = "none"
      delete_tab.style.display = "none"

    })
  }

  if(delete_btn){
    delete_btn.addEventListener("click", (e) => {

      const deletePostRef = doc(db, 'posts', delete_btn.id)
      

      let oldmediaURL = ref(storage, `${document.getElementById(delete_btn.id).childNodes[3].src}`)
      console.log(oldmediaURL)

      deleteDoc(deletePostRef)
      .then( () => {
        blurr.style.display = "none"
        delete_tab.style.display = "none"
      })
      .catch(() => {
        document.getElementById("wait").style.display ="none"
        document.getElementById("fail").style.display ="block"
      })

      deleteObject(oldmediaURL).then( () => {
        console.log("media deleted")
        oldmediaURL = ""
      })
      .catch( () => {
        console.log("delete error")
      })
    })

  }
  //////////////////////////////////////////////////////////////////////////////


  //Editing posts///////////////////////////////////////////////////////////////
  if(edit_cancel){
    edit_cancel.addEventListener("click", (e) => {

      blurr.style.display = "none"
      edit_tab.style.display = "none"

    })
  }

  if(edit_btn){
    edit_btn.addEventListener("click", (e) => {

      const updatePostRef = doc(db, "posts", edit_btn.id)
      document.getElementById("wait").style.display ="block"

      updateDoc(updatePostRef , {
        description: edit_description.value
      })
      .then( () => {
        blurr.style.display = "none"
        edit_tab.style.display = "none"
        document.getElementById("wait").style.display ="none"
        document.getElementById("success").style.display ="block"
      })
      .catch(() => {
        document.getElementById("wait").style.display ="none"
        document.getElementById("fail").style.display ="block"
      })
    })
  }
  //////////////////////////////////////////////////////////////////////////////


  //Editing profile /////////////////////////////////////////////////////////////


  if(profile_img_input){
    profile_img_input.addEventListener("input",function() {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        edit_profile_media.src = reader.result
      })
      reader.readAsDataURL(this.files[0])
    })
  }

  if(edit_button){
    edit_button.addEventListener("click", (e) => {

      blurr.style.display = "block"
      edit_profile_tab.style.display = "block"

      edit_profile_media.src = localStorage.getItem("profile_pic")
      edit_profile_desc.value = localStorage.getItem("description")
      profile_img_input.value = ""

    })
  }

  if(edit_profile_cancel){
    edit_profile_cancel.addEventListener("click", (e) => {

      blurr.style.display = "none"
      edit_profile_tab.style.display = "none"

    })
  }

  if(edit_profile_btn){
    edit_profile_btn.addEventListener("click", (e) => {

      const pic = document.querySelector(".profile-pic")
      const description = document.querySelector(".description")

      let updateUserRef = null
      if(localStorage.getItem("account_type") == "company"){
        updateUserRef = doc(db, "companies", localStorage.getItem("userID"))
      }
      else{
        updateUserRef = doc(db, "users", localStorage.getItem("userID"))
      }
       
      document.getElementById("wait").style.display ="block"

      let oldmediaURL = ref(storage, `${localStorage.getItem("profile_pic")}`)

      const file =  profile_img_input.files[0]
      const mediaRef = ref(storage, `media/${ v4() }`);
      let mediaURL = ""

      uploadBytes(mediaRef, file).then( () => {
        getDownloadURL(mediaRef).then( (url) => {
          mediaURL = url
          console.log("uploading")

      updateDoc(updateUserRef , {
        description: edit_profile_desc.value,
        profile_pic: `${mediaURL}`
      })
      .then( () => {
        localStorage.setItem("description", edit_profile_desc.value)
        localStorage.setItem("profile_pic", `${mediaURL}`)
        pic.src = localStorage.getItem("profile_pic")
        description.innerHTML = localStorage.getItem("description")
        blurr.style.display = "none"
        edit_profile_tab.style.display = "none"
        document.getElementById("wait").style.display ="none"
        

      })
      .catch(() => {
        console.log("update error")
      })

      deleteObject(oldmediaURL).then( () => {
        console.log("media deleted")
      })
      .catch( () => {
        console.log("delete error")
      })

    })
  })
    })
  }


  //////////////////////////////////////////////////////////////////////////////

  //  Signing out  /////////////////////////////////////////////////////////////

  const sign_out = document.querySelector(".signout")
  const sign_out_tab = document.querySelector(".sign_out_tab")
  const sign_out_btn = document.querySelector("#sign_out_btn")
  const sign_out_cancel = document.querySelector("#sign_out_cancel")

  if(sign_out){
    sign_out.addEventListener("click", (e) => {
      blurr.style.display = "block"
      sign_out_tab.style.display = "block"
    })
  }

  if(sign_out_btn){
    sign_out_btn.addEventListener("click", (e) => {
      localStorage.clear()
      location.href = "login.html"
    })
  }

  if(sign_out_cancel){
    sign_out_cancel.addEventListener("click", (e) => {
      blurr.style.display = "none"
      sign_out_tab.style.display = "none"
    })

  }
}

let log_out = null

if(document.getElementById("profile-menu")){
  log_out = document.getElementById("profile-menu").children[1].children[3]
}

if(log_out){
  log_out.addEventListener("click" , () => {
      localStorage.clear()
      location.href = "login.html"
  })
}


//////////////////////////////////////////////////////////////////////////////


// displaying posts in health /////////////////////////////////////////////////

const health_section2 = document.querySelector(".health-section2") 

if(health_section2) {

  let most_liked = localStorage.getItem("most_liked")? localStorage.getItem("most_liked").toLowerCase().split(",") : ["0","0","0","0","0","0"]
  const q = query(postRef, where("type", "==", "health"), orderBy("createdAT", "desc"))
  const q2 = query(postRef, and(where("type", "==", "health"), where("tag", "in", most_liked)), orderBy("createdAT", "desc")  )
  const q3 = query(postRef, and(where("type", "==", "health"), where("tag", "not-in", most_liked)), orderBy("createdAT", "desc")  )

  
  let posts = []

  if(filter_btn){
    filter_btn.addEventListener("click", () => {

      if(filter.value == "Username" && filter_input.value != ""){
        const userq = query(postRef, and(where("type", "==", "health"), where("user_display_name", ">=", `${filter_input.value}`), where("user_display_name", "<=", `${filter_input.value}` + "\uf8ff")), orderBy("createdAT", "desc")  ) 
       console.log("Looking for user")
       loading.style.display = "block"

        getDocs(userq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
    
          
          loading.style.display = "none"
          health_section2.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
              `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".health-section2").appendChild(community_posts);
          })
    
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
         })
        .catch(err => {
        console.log(err.message)
        })

      }
      else if(filter.value == "Description" && filter_input.value != ""){
        const filterValue = filter_input.value.toLowerCase().trim()
        filter_input.value = filterValue
        const descq = query(postRef, and(where("type", "==", "health"), where("description", ">=", `${filter_input.value}`), where("description", "<=", `${filter_input.value}` + "\uf8ff")), orderBy("createdAT", "desc")  ) 

        console.log("looking for desc")
       loading.style.display = "block"

        getDocs(descq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
    
          
          loading.style.display = "none"
          health_section2.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".health-section2").appendChild(community_posts);
          })
    
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
         })
        .catch(err => {
        console.log(err.message)
        })


      }
      else if(filter.value == "Tag" && filter_input.value != ""){
        const filterValue = filter_input.value.toLowerCase().trim()
        filter_input.value = filterValue
        const tagq = query(postRef, and(where("type", "==", "health"), where("tag", ">=", `${filter_input.value}`), where("tag", "<=", `${filter_input.value}` + "\uf8ff")),orderBy("createdAT", "desc")  ) 

        console.log("looking for tag")
        loading.style.display = "block"

        getDocs(tagq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          health_section2.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".health-section2").appendChild(community_posts);
          })
    
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
         })
        .catch(err => {
        console.log(err.message)
        })


      }
      else if(filter.value == "Recommended"){

        loading.style.display = "block"

        if(most_liked[1] == "0" && most_liked[3] == "0" && most_liked[5] == "0"){
          getDocs(q)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
            
            loading.style.display = "none"
            health_section2.innerHTML = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".health-section2").appendChild(community_posts);
            })
      
            //1
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);

            const sharecollection = document.querySelectorAll("#share-btn")
            const arr7 = Array.prototype.slice.call(sharecollection);
      
            arr7.forEach( (elmnt) => {
      
              elmnt.addEventListener("click", () => {
      
                copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
                alert("link copied")
              })
      
            })
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
      
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
           })
          .catch(err => {
          console.log(err.message)
          })
        
        }
        else{
          getDocs(q2)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
            
            loading.style.display = "none"
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".health-section2").appendChild(community_posts);
            })
      
           })
          .catch(err => {
          console.log(err.message)
          })
      
          getDocs(q3)
          .then((snapshot) => {
            posts = []
            snapshot.docs.forEach((doc) => {
              posts.push({...doc.data(), id: doc.id})
            })
      
            health_section2.innerHTML = ""
            
            let community_posts = null
      
            posts.forEach( (e) => {
      
              let liked = false
      
              for(const i in e.likes){
                if(e.likes[i] == localStorage.getItem("userID")){
                  liked = true
                }
              }
      
              community_posts = createPosts(`
                <div class="main" id=${e.id}>
                  <div class="postcard">
                    <div class="user-name">
                      <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                              <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                    </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                    <div class="reacts">
                      <button id="like" class="react-box" >
                        <img  id=${e.id}
                              class=${e.tag}
                              width="20px" 
                              height=${liked? '17px' : '20px'} 
                              src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                              alt="like"/>Like
                      </button>
                      <button id="comment-btn" class="react-box">
                        <img  id=${e.id}
                              width="20px"
                              height="20px"
                              src="./image/comment-dots-regular.svg"
                              alt="comment "/>Comment
                      </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                    </div>
                  </div>
      
                  <div class="comments" id=${e.id}>
                  </div>
      
                </div>
            `);
            document.querySelector(".health-section2").appendChild(community_posts);
            })
      
            //1
      
            const likecollection = document.querySelectorAll("#like")
            const arr = Array.prototype.slice.call(likecollection);
      
            const commentcollection = document.querySelectorAll("#comment-btn")
            const arr2 = Array.prototype.slice.call(commentcollection);
      
            const commentcollection2 = document.querySelectorAll(".comments")
            const arr3 = Array.prototype.slice.call(commentcollection2);
      
            const postcollection = document.querySelectorAll(".post_media")
            const arr4 = Array.prototype.slice.call(postcollection);

            const sharecollection = document.querySelectorAll("#share-btn")
            const arr7 = Array.prototype.slice.call(sharecollection);
      
            arr7.forEach( (elmnt) => {
      
              elmnt.addEventListener("click", () => {
      
                copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
                alert("link copied")
              })
      
            })
          
            arr.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
                
                const docRef = doc(db, "posts", elmnt.children[0].id)
      
                const userRef = doc(db, "users", localStorage.getItem("userID"))
      
                getDoc(docRef)
                  .then((post) => {
      
                    if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                      
                      elmnt.children[0].src = "../dist/image/heart2.png"
                      elmnt.children[0].height = "17"
                      elmnt.disabled = true
      
                      const arr = post.data().likes
                      arr.push(`${localStorage.getItem("userID")}`)
      
                      updateDoc(docRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                          .then( (user) => {
      
                            const interests = new Map(Object.entries(user.data().Interests));
                            interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                            const interests2 = Object.fromEntries(interests);
      
                            updateDoc(userRef, {
                              Interests: interests2
                            })
                          })
                          elmnt.disabled = false
                      })
                    }
                    else{
                      elmnt.children[0].src = "../dist/image/heart-regular.svg"
                      elmnt.children[0].height = "20"
                      elmnt.disabled = true
      
                      const updatePostRef = doc(db, "posts", post.id)
                      const arr = post.data().likes
                      arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
      
                      updateDoc(updatePostRef , {
                        likes: arr
                      })
                      .then( () => {
                        getDoc(userRef)
                        .then( (user) => {
      
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                          const interests2 = Object.fromEntries(interests);
      
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                      })
                    }
                  })
      
                })
      
            })
      
            arr2.forEach((elmnt) => {
              elmnt.addEventListener("click", () => {
      
                if(!localStorage.getItem("userID")){
      
                  const text = "you are currently in guest mode if you want to check the website features please log in"
                  if (confirm(text) == true) {
                    location.href = "login.html"
                  }
                }
                else{
                  post_id_comment = elmnt.children[0].id
                  blurr.style.display = "block"
                  comment_tab.style.display = "block"
                  }
              })
            })
          
            if(make_comment_btn){
              make_comment_btn.addEventListener("click", () =>{
          
                if(comment_text2.value != ""){
                  loading.style.display = "block"
                  addDoc(commentRef,{
                    comment: comment_text2.value,
                    createdAT: serverTimestamp(),
                    post_id: post_id_comment,
                    user_id: localStorage.getItem("userID"),
                    user_pic: localStorage.getItem("profile_pic"),
                    username: localStorage.getItem("displayName")
                  })
                  .then( () => {
                    post_id_comment = ""
                    comment_text2.value = ""
                    loading.style.display = "none"
                    comment_tab.style.display = "none"
                    blurr.style.display = "none"
                  })
                }
              })    
            }
          
            if(make_comment_cancel){
              make_comment_cancel.addEventListener("click", () => {
                post_id_comment = ""
                comment_text2.value = ""
                comment_tab.style.display = "none"
                blurr.style.display = "none"
              })
            }
      
      
            arr3.forEach((elmnt) => {
              const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
      
              onSnapshot(q, (snapshot) => {
                let allcomments = []
                snapshot.docs.forEach( (doc) => {
                  allcomments.push({...doc.data(), id:doc.id})
                })
      
                elmnt.innerHTML = null
                let commentElmnt = null
                let commentFound = false
      
                if(allcomments.length != 0){
                  commentFound = true
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name"> ${comment.username} </p>
                        <p class="comment_text"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    elmnt.appendChild(commentElmnt);
                })          
              }
              else{
                commentElmnt = createPosts(`
      
                  <div class="no_comments">
                      <h2>No comments</h2>
                  </div>
                  `)
                elmnt.appendChild(commentElmnt);
              }
              })
            })
      
            arr4.forEach( (post) => {
              post.addEventListener("click", () => {
      
                const q = doc(db, "posts", post.id)
                const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
                const bigger_post = document.querySelector(".main3")
                const bigger_post_no_comments = document.getElementById("no_comments2")
                const bigger_post_comments = document.getElementById("comments2")
                const close_btn = document.querySelector(".close_btn")
                let allcomments = []
      
                if(close_btn){
                  close_btn.addEventListener("click", () => {
                    bigger_post.style.display = "none"
      
                    bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                    bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                    bigger_post.children[0].children[1].innerHTML = "..."
                    bigger_post.children[0].children[2].src = "./image/loading.gif"
                    bigger_post.children[0].children[3].src = "./image/loading.gif"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[3].style.display = "none"
      
                    bigger_post_comments.innerHTML = `
                      <div class="no_comments" id="no_comments2" >
                        <h2>No comments</h2>
                      </div>
                    `
                  })
                }
      
                bigger_post.style.display = "flex block"
      
                getDoc(q)
                  .then( (post2) => {
                    if(post2.data().video){
                      bigger_post.children[0].children[2].style.display = "none"
                      bigger_post.children[0].children[3].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[3].src = post2.data().media
                    }
                    else{
                      bigger_post.children[0].children[3].style.display = "none"
                      bigger_post.children[0].children[2].style.display = "block"
                      bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                      bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                      bigger_post.children[0].children[1].innerHTML = post2.data().description
                      bigger_post.children[0].children[2].src = post2.data().media
                    }
                  })
                  getDocs(q2)
                    .then( (snapshot) => {
                      snapshot.docs.forEach((doc) => {
                        allcomments.push({...doc.data(), id: doc.id})
                      })
      
                      let commentElmnt = null
      
                      if(allcomments.length != 0){
                        bigger_post_no_comments.style.display = "none"
                        allcomments.forEach( (comment) =>{
                        commentElmnt = createPosts(`
            
                          <div class="comment" style="display:'flex block';" >
                            <img src= ${comment.user_pic}  alt="Profile logo" />
                            <div>
                              <p class="comment_name3"> ${comment.username} </p>
                              <p class="comment_text3"> ${comment.comment} </p>
                            </div>
                          </div>
                          `)
                          bigger_post_comments.appendChild(commentElmnt);
                      })          
                    }
      
                    })
                
              })
            })
      
           })
          .catch(err => {
          console.log(err.message)
          })
      
        }
        
      }
      else if(filter.value == "Date"){

        const dateq = query(postRef, where("type", "==", "health"), orderBy("createdAT", "desc")  ) 

        loading.style.display = "block"

        getDocs(dateq)
        .then((snapshot) => {
          posts = []
          snapshot.docs.forEach((doc) => {
            posts.push({...doc.data(), id: doc.id})
          })
          
          loading.style.display = "none"
          health_section2.innerHTML = ""
          
          let community_posts = null
    
          posts.forEach( (e) => {
    
            let liked = false
    
            for(const i in e.likes){
              if(e.likes[i] == localStorage.getItem("userID")){
                liked = true
              }
            }
    
            community_posts = createPosts(`
              <div class="main" id=${e.id}>
                <div class="postcard">
                  <div class="user-name">
                    <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                            <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
                  </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
                  <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
                  </div>
                </div>
    
                <div class="comments" id=${e.id}>
                </div>
    
              </div>
          `);
          document.querySelector(".health-section2").appendChild(community_posts);
          })
    
    
          const likecollection = document.querySelectorAll("#like")
          const arr = Array.prototype.slice.call(likecollection);
    
          const commentcollection = document.querySelectorAll("#comment-btn")
          const arr2 = Array.prototype.slice.call(commentcollection);
    
          const commentcollection2 = document.querySelectorAll(".comments")
          const arr3 = Array.prototype.slice.call(commentcollection2);
    
          const postcollection = document.querySelectorAll(".post_media")
          const arr4 = Array.prototype.slice.call(postcollection);

          const profilecollection = document.querySelectorAll(".user_profile_pic")
          const arr6 = Array.prototype.slice.call(profilecollection);

          const sharecollection = document.querySelectorAll("#share-btn")
          const arr7 = Array.prototype.slice.call(sharecollection);
    
          arr7.forEach( (elmnt) => {
    
            elmnt.addEventListener("click", () => {
    
              copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
              alert("link copied")
            })
    
          })

          arr6.forEach( (elmnt) => {
            elmnt.addEventListener("click", () => {

              localStorage.setItem("other_user", `${elmnt.id}`)
              location.href = "Profile2.html"
            })

          })
        
          arr.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              
              const docRef = doc(db, "posts", elmnt.children[0].id)
              const userRef = doc(db, "users", localStorage.getItem("userID"))
    
              getDoc(docRef)
                .then((post) => {
    
                  if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                    
                    elmnt.children[0].src = "../dist/image/heart2.png"
                    elmnt.children[0].height = "17"
                    elmnt.disabled = true
    
                    const arr = post.data().likes
                    arr.push(`${localStorage.getItem("userID")}`)
    
                    updateDoc(docRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                        .then( (user) => {
    
                          const interests = new Map(Object.entries(user.data().Interests));
                          interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                          const interests2 = Object.fromEntries(interests);
    
                          updateDoc(userRef, {
                            Interests: interests2
                          })
                        })
                        elmnt.disabled = false
                    })
                  }
                  else{
                    elmnt.children[0].src = "../dist/image/heart-regular.svg"
                    elmnt.children[0].height = "20"
                    elmnt.disabled = true
    
                    const updatePostRef = doc(db, "posts", post.id)
                    const arr = post.data().likes
                    arr.splice(arr.indexOf(localStorage.getItem("userID")),1)
    
                    updateDoc(updatePostRef , {
                      likes: arr
                    })
                    .then( () => {
                      getDoc(userRef)
                      .then( (user) => {
    
                        const interests = new Map(Object.entries(user.data().Interests));
                        interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                        const interests2 = Object.fromEntries(interests);
    
                        updateDoc(userRef, {
                          Interests: interests2
                        })
                      })
                      elmnt.disabled = false
                    })
                  }
                })
    
              })
    
          })
    
          arr2.forEach((elmnt) => {
            elmnt.addEventListener("click", () => {
    
              if(!localStorage.getItem("userID")){
    
                const text = "you are currently in guest mode if you want to check the website features please log in"
                if (confirm(text) == true) {
                  location.href = "login.html"
                }
              }
              else{
                post_id_comment = elmnt.children[0].id
                blurr.style.display = "block"
                comment_tab.style.display = "block"
                }
            })
          })
        
          if(make_comment_btn){
            make_comment_btn.addEventListener("click", () =>{
        
              if(comment_text2.value != ""){
                loading.style.display = "block"
                addDoc(commentRef,{
                  comment: comment_text2.value,
                  createdAT: serverTimestamp(),
                  post_id: post_id_comment,
                  user_id: localStorage.getItem("userID"),
                  user_pic: localStorage.getItem("profile_pic"),
                  username: localStorage.getItem("displayName")
                })
                .then( () => {
                  post_id_comment = ""
                  comment_text2.value = ""
                  loading.style.display = "none"
                  comment_tab.style.display = "none"
                  blurr.style.display = "none"
                })
              }
            })    
          }
        
          if(make_comment_cancel){
            make_comment_cancel.addEventListener("click", () => {
              post_id_comment = ""
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
    
    
          arr3.forEach((elmnt) => {
            const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))
    
            onSnapshot(q, (snapshot) => {
              let allcomments = []
              snapshot.docs.forEach( (doc) => {
                allcomments.push({...doc.data(), id:doc.id})
              })
    
              elmnt.innerHTML = null
              let commentElmnt = null
              let commentFound = false
    
              if(allcomments.length != 0){
                commentFound = true
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name"> ${comment.username} </p>
                      <p class="comment_text"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  elmnt.appendChild(commentElmnt);
              })          
            }
            else{
              commentElmnt = createPosts(`
    
                <div class="no_comments">
                    <h2>No comments</h2>
                </div>
                `)
              elmnt.appendChild(commentElmnt);
            }
            })
          })
    
          arr4.forEach( (post) => {
            post.addEventListener("click", () => {
    
              const q = doc(db, "posts", post.id)
              const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
    
              const bigger_post = document.querySelector(".main3")
              const bigger_post_no_comments = document.getElementById("no_comments2")
              const bigger_post_comments = document.getElementById("comments2")
              const close_btn = document.querySelector(".close_btn")
              let allcomments = []
    
              if(close_btn){
                close_btn.addEventListener("click", () => {
                  bigger_post.style.display = "none"
    
                  bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
                  bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
                  bigger_post.children[0].children[1].innerHTML = "..."
                  bigger_post.children[0].children[2].src = "./image/loading.gif"
                  bigger_post.children[0].children[3].src = "./image/loading.gif"
                  bigger_post.children[0].children[2].style.display = "block"
                  bigger_post.children[0].children[3].style.display = "none"
    
                  bigger_post_comments.innerHTML = `
                    <div class="no_comments" id="no_comments2" >
                      <h2>No comments</h2>
                    </div>
                  `
                })
              }
    
              bigger_post.style.display = "flex block"
    
              getDoc(q)
                .then( (post2) => {
                  if(post2.data().video){
                    bigger_post.children[0].children[2].style.display = "none"
                    bigger_post.children[0].children[3].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[3].src = post2.data().media
                  }
                  else{
                    bigger_post.children[0].children[3].style.display = "none"
                    bigger_post.children[0].children[2].style.display = "block"
                    bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                    bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                    bigger_post.children[0].children[1].innerHTML = post2.data().description
                    bigger_post.children[0].children[2].src = post2.data().media
                  }
                })
                getDocs(q2)
                  .then( (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      allcomments.push({...doc.data(), id: doc.id})
                    })
    
                    let commentElmnt = null
    
                    if(allcomments.length != 0){
                      bigger_post_no_comments.style.display = "none"
                      allcomments.forEach( (comment) =>{
                      commentElmnt = createPosts(`
          
                        <div class="comment" style="display:'flex block';" >
                          <img src= ${comment.user_pic}  alt="Profile logo" />
                          <div>
                            <p class="comment_name3"> ${comment.username} </p>
                            <p class="comment_text3"> ${comment.comment} </p>
                          </div>
                        </div>
                        `)
                        bigger_post_comments.appendChild(commentElmnt);
                    })          
                  }
    
                  })
              
            })
          })
    
         })
        .catch(err => {
        console.log(err.message)
        })


      }

    })
  }


  if(most_liked[1] == "0" && most_liked[3] == "0" && most_liked[5] == "0"){
    getDocs(q)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      document.querySelector(".main2").style.display = "none"
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
              ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".health-section2").appendChild(community_posts);
      })


      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const profilecollection = document.querySelectorAll(".user_profile_pic")
      const arr6 = Array.prototype.slice.call(profilecollection);

      const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
          alert("link copied")
        })

      })

      arr6.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {

          localStorage.setItem("other_user", `${elmnt.id}`)
          location.href = "Profile2.html"
        })

      })
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })

     })
    .catch(err => {
    console.log(err.message)
    })
  
  }
  else{
    getDocs(q2)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".health-section2").appendChild(community_posts);
      })

     })
    .catch(err => {
    console.log(err.message)
    })

    getDocs(q3)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      document.querySelector(".main2").style.display = "none"
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
            ${e.textonly? 
 `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".health-section2").appendChild(community_posts);
      })

      //1

      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const profilecollection = document.querySelectorAll(".user_profile_pic")
      const arr6 = Array.prototype.slice.call(profilecollection);

      const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
          alert("link copied")
        })

      })

      arr6.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {

          localStorage.setItem("other_user", `${elmnt.id}`)
          location.href = "Profile2.html"
        })

      })
    
      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {
          
          const docRef = doc(db, "posts", elmnt.children[0].id)

          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })
    
      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{
    
          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }
    
      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_text2.value = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))
          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })

     })
    .catch(err => {
    console.log(err.message)
    })

  }

}



///////////////////////////////////////////////////////////////////////////////


// feedback form //////////////////////////////////////////////////////////////

let feedback_btn = null
let feedback_txt = null
if(document.getElementById("feedback-form")){
  feedback_btn = document.getElementById("feedback-form").children[1]
  feedback_txt = document.getElementById("feedback-form").children[0]
}

if(feedback_btn){
  feedback_btn.addEventListener("click", () => {

    if(!localStorage.getItem("userID")){
      const text = "you are currently in guest mode if you want to check the website features please log in"
      if (confirm(text) == true) {
        location.href = "login.html"
      } 
    }

    else if(feedback_txt.value != ""){
      addDoc(feedbackRef,{
        user_id: localStorage.getItem("userID"),
        user_name: localStorage.getItem("displayName"),
        user_email: localStorage.getItem("email"),
        text: feedback_txt.value,
        createdAT: serverTimestamp(),
        createdAT2: `${Timestamp.now().toDate().getDate()}-${Timestamp.now().toDate().getHours()}:${Timestamp.now().toDate().getMinutes()}`,
      })
    }
})
}


///////////////////////////////////////////////////////////////////////////////

// contact us form //////////////////////////////////////////////////////////////

const contact_us_form = document.querySelector(".contact_us_form")

if(contact_us_form){
  contact_us_form.name.value = localStorage.getItem("displayName")
  contact_us_form.email.value = localStorage.getItem("email")

  contact_us_form.addEventListener("submit", (e) => {
    e.preventDefault()

    if(!localStorage.getItem("userID")){
      const text = "you are currently in guest mode if you want to check the website features please log in"
      if (confirm(text) == true) {
        location.href = "login.html"
      } 
    }

    else if(contact_us_form.message.value != ""){
      addDoc(feedbackRef,{
        user_id: localStorage.getItem("userID"),
        user_name: localStorage.getItem("displayName"),
        user_email: localStorage.getItem("email"),
        text: contact_us_form.message.value,
        createdAT: serverTimestamp()
      })
      .then( () => {
        alert("message sent")
        contact_us_form.reset()
      }) 
    }
})
}



///////////////////////////////////////////////////////////////////////////////



// if admin ///////////////////////////////////////////////////////////////////

let adminq = ""

if(localStorage.getItem("userID")){
  adminq = doc(db, "Admin", localStorage.getItem("userID"))

  setTimeout(() => {

    getDoc(adminq)
    .then( (snapshot) => {
  
      if(snapshot.data()){

      const nav_links = document.querySelector(".nav-links")
        
      const profile_page2 = document.getElementById("profile_page2")
      const share_profile_btn = document.getElementById("share-profile-btn")
  
      const Page_value = document.querySelector(".page-value")
  
      const sharecollection = document.querySelectorAll("#share-btn")
      const arr = Array.prototype.slice.call(sharecollection);
      let childid = null
  
      if(sharecollection){
  
        arr.forEach( (elmnt) => {
          childid = elmnt.children[0].id
          elmnt.innerHTML = `
            <img  id=${childid}
              width="20px"
              height="20px" 
              src="./image/delete.svg" 
              alt="share"/>Delete
          `
          elmnt.addEventListener("click" , () => {
    
            const deletePostRef = doc(db, 'posts',  elmnt.children[0].id)
          
            const oldmediaURL = ref(storage, `${document.getElementById(elmnt.children[0].id).children[0].children[2].src}`)
    
    
            deleteDoc(deletePostRef)
    
            deleteObject(oldmediaURL)
            .then( () => {
              oldmediaURL = ""
            })
    
          })
    
        })
  
      }
  
      if(profile_page2){
        share_profile_btn.innerHTML = " Ban User"
  
        share_profile_btn.addEventListener("click" , () => {
  
          const deleteUserRef = doc(db, 'users',  localStorage.getItem("other_user"))
  
          deleteDoc(deleteUserRef)
          
        })
      }
    
      if(Page_value){
        Page_value.innerHTML = `
        <option value="community">Community</option>
        <option value="work">Work</option>
        <option value="volunteer">Volunteer</option>
        <option value="health">Health</option>
  `
      }

      if(nav_links){
        console.log("link added")

        nav_links.innerHTML += `
            <li><img width="20px" height="20px" src="./image/form.png" />
                <a href="feedback.html" id="forms-text">Feedback</a>
            </li>
        `        

      }



      }
  
  
    })
    .catch( (error) => {
        console.log(error)
    })
  
  }, 5000);

}




///////////////////////////////////////////////////////////////////////////////


// change password page ///////////////////////////////////////////////////////

const settings_container = document.querySelector(".settings-container")

if(settings_container){

  const password_change_form = document.getElementById("password-change-form")
  const changepassRef = doc(db, "users", localStorage.getItem("userID"))

  password_change_form.addEventListener("submit", (e) => {

    e.preventDefault()
    console.log("checking data")

    getDoc(changepassRef)
    .then( (user) => {

      if( password_change_form.email.value == user.data().email &&
          password_change_form.old_password.value == user.data().password &&
          password_change_form.new_password.value  ==  password_change_form.confirm_new_password.value){
            updateDoc(changepassRef, {
              password : `${password_change_form.new_password.value}`
            })
            .then( () => {
              console.log("password changed")
              password_change_form.reset()
              alert("Password changed successfully")
            }) 
      }
      else if(password_change_form.email.value != user.data().email){
        alert("Incorrect Email")
        console.log(password_change_form.email.value)
        console.log(user.data().email)
      }
      else if( password_change_form.old_password.value != user.data().password){
        alert("Incorrect Password")
        console.log( password_change_form.old_password.value)
        console.log(password_change_form.email.value)
      }
      else if(password_change_form.new_password.value  !=  password_change_form.confirm_new_password.value){
        alert("New Password isn't the same as the Confirm New Password")
      }
      else if(password_change_form.old_password.value   !=  password_change_form.new_password.value ){
        alert("New Password cannot be the same as the old Password")
      }

    })

  })

}


///////////////////////////////////////////////////////////////////////////////



// feddback page //////////////////////////////////////////////////////////////


const feedback_section2 = document.querySelector(".feedback-section2")


if(feedback_section2) {

  const q = query(feedbackRef, orderBy("createdAT", "desc"))
  
  let posts = []

  if(!localStorage.getItem("userID") || localStorage.getItem("account_type") != "admin" ){

    const text = "you are currently in guest mode if you want to check the website features please log in"
    if (confirm(text) == true) {
      location.href = "login.html"
    }
    else{
      location.href = "login.html"
    }
  }

    getDocs(q)
    .then((snapshot) => {
      posts = []
      snapshot.docs.forEach((doc) => {
        posts.push({...doc.data(), id: doc.id})
      })

      document.querySelector(".main2").style.display = "none"
      
      let community_posts = null

      console.log(posts)

      posts.forEach( (e) => {
        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                  <p>${e.user_name}</p>
              </div>  
              <p class="description">${e.text}</p>
            </div>

          </div>
      `);
      document.querySelector(".feedback-section2").appendChild(community_posts);
      })



     })
    .catch(err => {
    console.log(err.message)
    })

}



////////////////////////////////////////////////////////////////////////////////



// posting from other pages ////////////////////////////////////////////////////

const photo_video = document.querySelector(".photo-video")

if(photo_video){
  photo_video.addEventListener("click", () => {

    blurr.style.display = "block"
    make_post_tab.style.display = "block"

  })
}

const feeling_activity = document.querySelector(".feeling-activity")
let user_info_input = ""
if(feeling_activity){
  user_info_input = document.querySelector(".user-info").children[1]
}

let post_type = ""

if(community_page_id){ post_type = "community" }
else if(work_page_id){ post_type = "work" } 
else if(volunteer_page_id){ post_type = "volunteer" }
else if(health_section2){ post_type = "health" }

if(feeling_activity){


  feeling_activity.addEventListener("click", () => {

    if(post_type == "work" && localStorage.getItem("account_type") == "normal" ){
      alert("only companies can post in the work page")
      user_info_input.value = ""
    }
    else if(post_type == "community" &&  localStorage.getItem("account_type") == "company"){
      alert("only normal users can post in the community page")
      user_info_input.value = ""
    }
    else if(post_type == "health" &&  localStorage.getItem("account_type") != "admin"){
      alert("only admins can post in the health page")
      user_info_input.value = ""
    }

    else if(user_info_input.value != "") {
      
      addDoc(postRef,{
        user_id: localStorage.getItem("userID"),
        user_display_name: localStorage.getItem("displayName"),
        profile_pic: localStorage.getItem("profile_pic"),
        description: user_info_input.value, 
        likes: ["0"],
        media: "",
        video: false,
        textonly: true,
        createdAT: serverTimestamp(),
        createdAT2: `${Timestamp.now().toDate().getDate()}/${ months[Timestamp.now().toDate().getMonth()]}`,
        type: post_type,
        tag: "none"

      })
      .then(() => {
  
        post_desc.value = ""
        post_vid.src = ""
        post_img.src = " "
        img_input.value = ""
        blurr.style.display = "none"
        make_post_tab.style.display = "none"
        tag_input.value = "none"
        user_info_input.value = ""
        document.getElementById("wait").style.display ="none"
        document.getElementById("success").style.display ="block"
        location.reload();
      })
      .catch(() => {
        document.getElementById("wait").style.display ="none"
        document.getElementById("fail").style.display ="block"
      })

    }

  })
}


////////////////////////////////////////////////////////////////////////////////

// displaying in share post ////////////////////////////////////////////////////

if(community_page_id && share_page){

  const urlParams = new URLSearchParams(window.location.search)
  const postId = urlParams.get("v")
  let posts = []

  const docRef = doc(db , "posts", postId)

  getDoc(docRef)
    .then((snapshot) => {

      posts.push({...snapshot.data(), id: snapshot.id})

      document.querySelector(".main2").style.display = "none"
      
      let community_posts = null

      posts.forEach( (e) => {

        let liked = false

        for(const i in e.likes){
          if(e.likes[i] == localStorage.getItem("userID")){
            liked = true
          }
        }

        community_posts = createPosts(`
          <div class="main" id=${e.id}>
            <div class="postcard">
              <div class="user-name">
                <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                        <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
              </div>  
              ${e.textonly? 
                `<textarea disabled class="text-only-description" >${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
            `}
              <div class="reacts">
                <button id="like" class="react-box" >
                  <img  id=${e.id}
                        class=${e.tag}
                        width="20px" 
                        height=${liked? '17px' : '20px'} 
                        src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                        alt="like"/>Like
                </button>
                <button id="comment-btn" class="react-box">
                  <img  id=${e.id}
                        width="20px"
                        height="20px"
                        src="./image/comment-dots-regular.svg"
                        alt="comment "/>Comment
                </button>
                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>
              </div>
            </div>

            <div class="comments" id=${e.id}>
            </div>

          </div>
      `);
      document.querySelector(".community-section2").appendChild(community_posts);
      })


      const likecollection = document.querySelectorAll("#like")
      const arr = Array.prototype.slice.call(likecollection);

      const commentcollection = document.querySelectorAll("#comment-btn")
      const arr2 = Array.prototype.slice.call(commentcollection);

      const commentcollection2 = document.querySelectorAll(".comments")
      const arr3 = Array.prototype.slice.call(commentcollection2);

      const postcollection = document.querySelectorAll(".post_media")
      const arr4 = Array.prototype.slice.call(postcollection);

      const profilecollection = document.querySelectorAll(".user_profile_pic")
      const arr6 = Array.prototype.slice.call(profilecollection);

      const sharecollection = document.querySelectorAll("#share-btn")
      const arr7 = Array.prototype.slice.call(sharecollection);

      arr7.forEach( (elmnt) => {

        elmnt.addEventListener("click", () => {

          copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
          alert("link copied")
          console.log("link copied")
        })

      })

      arr6.forEach( (elmnt) => {
        elmnt.addEventListener("click", () => {

          localStorage.setItem("other_user", `${elmnt.id}`)
          location.href = "Profile2.html"
        })

      })

      arr.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          
          const docRef = doc(db, "posts", elmnt.children[0].id)
          const userRef = doc(db, "users", localStorage.getItem("userID"))

          getDoc(docRef)
            .then((post) => {

              if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
                
                elmnt.children[0].src = "../dist/image/heart2.png"
                elmnt.children[0].height = "17"
                elmnt.disabled = true

                const arr = post.data().likes
                arr.push(`${localStorage.getItem("userID")}`)

                updateDoc(docRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                    .then( (user) => {

                      const interests = new Map(Object.entries(user.data().Interests));
                      interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                      const interests2 = Object.fromEntries(interests);

                      updateDoc(userRef, {
                        Interests: interests2
                      })
                    })
                    elmnt.disabled = false
                })
              }
              else{
                elmnt.children[0].src = "../dist/image/heart-regular.svg"
                elmnt.children[0].height = "20"
                elmnt.disabled = true

                const updatePostRef = doc(db, "posts", post.id)
                const arr = post.data().likes
                arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

                updateDoc(updatePostRef , {
                  likes: arr
                })
                .then( () => {
                  getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
                })
              }
            })

          })

      })

      arr2.forEach((elmnt) => {
        elmnt.addEventListener("click", () => {

          if(!localStorage.getItem("userID")){

            const text = "you are currently in guest mode if you want to check the website features please log in"
            if (confirm(text) == true) {
              location.href = "login.html"
            }
          }
          else{
            post_id_comment = elmnt.children[0].id
            blurr.style.display = "block"
            comment_tab.style.display = "block"
            }
        })
      })

      if(make_comment_btn){
        make_comment_btn.addEventListener("click", () =>{

          if(comment_text2.value != ""){
            loading.style.display = "block"
            addDoc(commentRef,{
              comment: comment_text2.value,
              createdAT: serverTimestamp(),
              post_id: post_id_comment,
              user_id: localStorage.getItem("userID"),
              user_pic: localStorage.getItem("profile_pic"),
              username: localStorage.getItem("displayName")
            })
            .then( () => {
              post_id_comment = ""
              comment_text2.value = ""
              loading.style.display = "none"
              comment_tab.style.display = "none"
              blurr.style.display = "none"
            })
          }
        })    
      }

      if(make_comment_cancel){
        make_comment_cancel.addEventListener("click", () => {
          post_id_comment = ""
          comment_tab.style.display = "none"
          blurr.style.display = "none"
        })
      }


      arr3.forEach((elmnt) => {
        const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

        onSnapshot(q, (snapshot) => {
          let allcomments = []
          snapshot.docs.forEach( (doc) => {
            allcomments.push({...doc.data(), id:doc.id})
          })

          elmnt.innerHTML = null
          let commentElmnt = null
          let commentFound = false

          if(allcomments.length != 0){
            commentFound = true
            allcomments.forEach( (comment) =>{
            commentElmnt = createPosts(`

              <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
                <img src= ${comment.user_pic}  alt="Profile logo" />
                <div>
                  <p class="comment_name"> ${comment.username} </p>
                  <p class="comment_text"> ${comment.comment} </p>
                </div>
              </div>
              `)
              elmnt.appendChild(commentElmnt);
          })          
        }
        else{
          commentElmnt = createPosts(`

            <div class="no_comments">
                <h2>No comments</h2>
            </div>
            `)
          elmnt.appendChild(commentElmnt);
        }
        })
      })

      arr4.forEach( (post) => {
        post.addEventListener("click", () => {

          const q = doc(db, "posts", post.id)
          const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

          const bigger_post = document.querySelector(".main3")
          const bigger_post_no_comments = document.getElementById("no_comments2")
          const bigger_post_comments = document.getElementById("comments2")
          const close_btn = document.querySelector(".close_btn")
          let allcomments = []

          if(close_btn){
            close_btn.addEventListener("click", () => {
              bigger_post.style.display = "none"

              bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
              bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
              bigger_post.children[0].children[1].innerHTML = "..."
              bigger_post.children[0].children[2].src = "./image/loading.gif"
              bigger_post.children[0].children[3].src = "./image/loading.gif"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[3].style.display = "none"

              bigger_post_comments.innerHTML = `
                <div class="no_comments" id="no_comments2" >
                  <h2>No comments</h2>
                </div>
              `
            })
          }

          bigger_post.style.display = "flex block"

          getDoc(q)
            .then( (post2) => {
              if(post2.data().video){
                bigger_post.children[0].children[2].style.display = "none"
                bigger_post.children[0].children[3].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[3].src = post2.data().media
              }
              else{
                bigger_post.children[0].children[3].style.display = "none"
                bigger_post.children[0].children[2].style.display = "block"
                bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
                bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
                bigger_post.children[0].children[1].innerHTML = post2.data().description
                bigger_post.children[0].children[2].src = post2.data().media
              }
            })
            getDocs(q2)
              .then( (snapshot) => {
                snapshot.docs.forEach((doc) => {
                  allcomments.push({...doc.data(), id: doc.id})
                })

                let commentElmnt = null

                if(allcomments.length != 0){
                  bigger_post_no_comments.style.display = "none"
                  allcomments.forEach( (comment) =>{
                  commentElmnt = createPosts(`
      
                    <div class="comment" style="display:'flex block';" >
                      <img src= ${comment.user_pic}  alt="Profile logo" />
                      <div>
                        <p class="comment_name3"> ${comment.username} </p>
                        <p class="comment_text3"> ${comment.comment} </p>
                      </div>
                    </div>
                    `)
                    bigger_post_comments.appendChild(commentElmnt);
                })          
              }

              })
          
        })
      })

    })

}


////////////////////////////////////////////////////////////////////////////////


// share profile button ////////////////////////////////////////////////////////


const share_profile_btn = document.getElementById("share-profile-btn")
let share_user_id = null
let share_ablity = false


if(share_profile_btn){

  setTimeout(() => {
    share_ablity = true
    share_user_id = document.querySelector(".profile-page")? document.querySelector(".profile-page").id :
     document.querySelector(".profile-page2")? document.querySelector(".profile-page2").id : document.querySelector(".share-profile-page").id
  }, 1000);
  
  share_profile_btn.addEventListener("click", () => {

    if(share_ablity){   
      copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/shareprofile.html?v=${share_user_id}`)
      console.log(share_user_id)
      alert("link copied")
    }
    else{
      alert("PLease wait a sec and try again")
    }
  })



}

////////////////////////////////////////////////////////////////////////////////

// displaying share profile ////////////////////////////////////////////////////

if(shar_profile_page){

  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get("v")

  const userRef = doc(db , "users", userId)
  const compRef = doc(db , "companies", userId)
  const adminRef = doc(db , "Admin", userId)

  const username = document.querySelector(".username")
  const profile_pic2 = document.querySelector(".profile-pic2")
  const profile_name = document.querySelector(".profile-name")
  const description = document.querySelector(".description")

  document.querySelector(".share-profile-page").id = userId


  getDoc(userRef)
    .then( (user) => {
      username.innerHTML = user.data().display_name
      profile_pic2.src = user.data().profile_pic
      profile_name.innerHTML = user.data().first_name + " " + user.data().last_name
      description.innerHTML = user.data().description
    })
    .catch( () => {
        getDoc(compRef)
        .then( (user) => {
          username.innerHTML = `${user.data().display_name} - ${user.data().location}` 
          profile_pic2.src = user.data().profile_pic
          profile_name.innerHTML = user.data().name
          description.innerHTML = user.data().description
        })
        .catch( () => {
            getDoc(adminRef)
            .then( (user) => {
              username.innerHTML = `${user.data().display_name} - ${user.data().location}` 
              profile_pic2.src = user.data().profile_pic
              profile_name.innerHTML = user.data().name
              description.innerHTML = user.data().description
            })
            .catch( (error) => {
              console.log(error)
            })
        })
    })


  const profile_page_q = query(postRef, where("user_id", "==", userId), orderBy("createdAT", "desc") )

  onSnapshot(profile_page_q, (snapshot) => {
    let profile_posts = []
    snapshot.docs.forEach( (doc) => {
      profile_posts.push({...doc.data(), id:doc.id})
    })

    postsN.childNodes[0].data = `${profile_posts.length}`
    document.getElementById("main").innerHTML = "";

    let profile_posts2 = null

    profile_posts.forEach( (e) => {

      let liked = false
    
      for(const i in e.likes){
        if(e.likes[i] == localStorage.getItem("userID")){
          liked = true
        }
      }

      let x = document.querySelector(".profile-pic-container").children[0].src

      if(e.profile_pic != x){
        const docRef = doc(db, "posts", e.id)
        updateDoc(docRef, {
          profile_pic: `${x}`
        })
      }

      profile_posts2 = createPosts(`
          <div class="postcard" id=${e.id} >
            <div class="user-name">
              <img src=${e.profile_pic} class="user_profile_pic" id="${e.user_id}" alt="Profile logo" />
                                    <p>${e.user_display_name}</p>
                      <p class="post-date" >${e.createdAT2?e.createdAT2:""}</p>
            </div>  
            ${e.textonly? 
              `<textarea disabled class="description" style="margin-bottom: 0; height: 258.5px;width: 100%;background-color: #00000000;border: 0px;resize: none;font-size: x-large;white-space: break-spaces; text-wrap: auto; overflow: scroll;">${e.description}</textarea>`
              :` 
              <p class="description">${e.description}</p>
              <${e.video? "video controls":"img"} id=${e.id} class="post_media" src=${e.media} alt="post image" /> ${e.video?"</video>": ""}
              `}
              <div class="reacts">
                    <button id="like" class="react-box" >
                      <img  id=${e.id}
                            class=${e.tag}
                            width="20px" 
                            height=${liked? '17px' : '20px'} 
                            src=${liked? './image/heart2.png' : './image/heart-regular.svg'} 
                            alt="like"/>Like
                    </button>
                    <button id="comment-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px"
                            src="./image/comment-dots-regular.svg"
                            alt="comment "/>Comment
                    </button>

                    <button id="share-btn" class="react-box">
                      <img  id=${e.id}
                            width="20px"
                            height="20px" 
                            src="./image/share-from-square-regular.svg" 
                            alt="share"/>Share
                    </button>

                  </div>
            
          </div>
      `);
      document.getElementById("main").appendChild(profile_posts2);
    })
    
    const likecollection = document.querySelectorAll("#like")
    const arr = Array.prototype.slice.call(likecollection);

    const commentcollection = document.querySelectorAll("#comment-btn")
    const arr2 = Array.prototype.slice.call(commentcollection);

    const commentcollection2 = document.querySelectorAll(".comments")
    const arr3 = Array.prototype.slice.call(commentcollection2);

    const postcollection = document.querySelectorAll(".post_media")
    const arr4 = Array.prototype.slice.call(postcollection);

    const profilecollection = document.querySelectorAll(".user_profile_pic")
    const arr6 = Array.prototype.slice.call(profilecollection);

    const sharecollection = document.querySelectorAll("#share-btn")
    const arr7 = Array.prototype.slice.call(sharecollection);

    arr7.forEach( (elmnt) => {

      elmnt.addEventListener("click", () => {

        copyText(`file:///C:/Users/abdul/Desktop/senior/Fresh%20start%20v13/dist/sharepost.html?v=${elmnt.children[0].id}`)
        alert("link copied")
      })

    })

    arr6.forEach( (elmnt) => {
      elmnt.addEventListener("click", () => {

        localStorage.setItem("other_user", `${elmnt.id}`)
        location.href = "Profile2.html"
      })

    })
  
    arr.forEach((elmnt) => {
      elmnt.addEventListener("click", () => {

        if(!localStorage.getItem("userID")){

          const text = "you are currently in guest mode if you want to check the website features please log in"
          if (confirm(text) == true) {
            location.href = "login.html"
          }
        }
        
        const docRef = doc(db, "posts", elmnt.children[0].id)
        const userRef = doc(db, "users", localStorage.getItem("userID"))

        getDoc(docRef)
          .then((post) => {

            if(!post.data().likes.includes(`${localStorage.getItem("userID")}`)){
              
              elmnt.children[0].src = "../dist/image/heart2.png"
              elmnt.children[0].height = "17"
              elmnt.disabled = true

              const arr = post.data().likes
              arr.push(`${localStorage.getItem("userID")}`)

              updateDoc(docRef , {
                likes: arr
              })
              .then( () => {
                getDoc(userRef)
                  .then( (user) => {

                    const interests = new Map(Object.entries(user.data().Interests));
                    interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) + 1 )
                    const interests2 = Object.fromEntries(interests);

                    updateDoc(userRef, {
                      Interests: interests2
                    })
                  })
                  elmnt.disabled = false
              })
            }
            else{
              elmnt.children[0].src = "../dist/image/heart-regular.svg"
              elmnt.children[0].height = "20"
              elmnt.disabled = true

              const updatePostRef = doc(db, "posts", post.id)
              const arr = post.data().likes
              arr.splice(arr.indexOf(localStorage.getItem("userID")),1)

              updateDoc(updatePostRef , {
                likes: arr
              })
              .then( () => {
                getDoc(userRef)
                .then( (user) => {

                  const interests = new Map(Object.entries(user.data().Interests));
                  interests.set(`${elmnt.children[0].className}`, interests.get(`${elmnt.children[0].className}`) - 1 )
                  const interests2 = Object.fromEntries(interests);

                  updateDoc(userRef, {
                    Interests: interests2
                  })
                })
                elmnt.disabled = false
              })
            }
          })

        })

    })

    arr2.forEach((elmnt) => {
      elmnt.addEventListener("click", () => {

        if(!localStorage.getItem("userID")){

          const text = "you are currently in guest mode if you want to check the website features please log in"
          if (confirm(text) == true) {
            location.href = "login.html"
          }
        }
        else{
          post_id_comment = elmnt.children[0].id
          blurr.style.display = "block"
          comment_tab.style.display = "block"
          }
      })
    })
  
    if(make_comment_btn){
      make_comment_btn.addEventListener("click", () =>{
  
        if(comment_text2.value != ""){
          loading.style.display = "block"
          addDoc(commentRef,{
            comment: comment_text2.value,
            createdAT: serverTimestamp(),
            post_id: post_id_comment,
            user_id: localStorage.getItem("userID"),
            user_pic: localStorage.getItem("profile_pic"),
            username: localStorage.getItem("displayName")
          })
          .then( () => {
            post_id_comment = ""
            comment_text2.value = ""
            loading.style.display = "none"
            comment_tab.style.display = "none"
            blurr.style.display = "none"
          })
        }
      })    
    }
  
    if(make_comment_cancel){
      make_comment_cancel.addEventListener("click", () => {
        post_id_comment = ""
        comment_tab.style.display = "none"
        blurr.style.display = "none"
      })
    }


    arr3.forEach((elmnt) => {
      const q = query(commentRef, where("post_id", "==", elmnt.id), orderBy("createdAT","asc"))

      onSnapshot(q, (snapshot) => {
        let allcomments = []
        snapshot.docs.forEach( (doc) => {
          allcomments.push({...doc.data(), id:doc.id})
        })

        elmnt.innerHTML = null
        let commentElmnt = null
        let commentFound = false

        if(allcomments.length != 0){
          commentFound = true
          allcomments.forEach( (comment) =>{
          commentElmnt = createPosts(`

            <div class="comment" style="display: ${commentFound? 'flex block': 'none'};" >
              <img src= ${comment.user_pic}  alt="Profile logo" />
              <div>
                <p class="comment_name"> ${comment.username} </p>
                <p class="comment_text"> ${comment.comment} </p>
              </div>
            </div>
            `)
            elmnt.appendChild(commentElmnt);
        })          
      }
      else{
        commentElmnt = createPosts(`

          <div class="no_comments">
              <h2>No comments</h2>
          </div>
          `)
        elmnt.appendChild(commentElmnt);
      }
      })
    })

    arr4.forEach( (post) => {
      post.addEventListener("click", () => {

        const q = doc(db, "posts", post.id)
        const q2 = query(commentRef, where("post_id", "==", post.id), orderBy("createdAT","asc"))

        const bigger_post = document.querySelector(".main3")
        const bigger_post_no_comments = document.getElementById("no_comments2")
        const bigger_post_comments = document.getElementById("comments2")
        const close_btn = document.querySelector(".close_btn")
        let allcomments = []

        if(close_btn){
          close_btn.addEventListener("click", () => {
            bigger_post.style.display = "none"

            bigger_post.children[0].children[0].children[0].src = "./image/loading.gif"
            bigger_post.children[0].children[0].children[1].innerHTML = "UserName"
            bigger_post.children[0].children[1].innerHTML = "..."
            bigger_post.children[0].children[2].src = "./image/loading.gif"
            bigger_post.children[0].children[3].src = "./image/loading.gif"
            bigger_post.children[0].children[2].style.display = "block"
            bigger_post.children[0].children[3].style.display = "none"

            bigger_post_comments.innerHTML = `
              <div class="no_comments" id="no_comments2" >
                <h2>No comments</h2>
              </div>
            `
          })
        }

        bigger_post.style.display = "flex block"

        getDoc(q)
          .then( (post2) => {
            if(post2.data().video){
              bigger_post.children[0].children[2].style.display = "none"
              bigger_post.children[0].children[3].style.display = "block"
              bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
              bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
              bigger_post.children[0].children[1].innerHTML = post2.data().description
              bigger_post.children[0].children[3].src = post2.data().media
            }
            else{
              bigger_post.children[0].children[3].style.display = "none"
              bigger_post.children[0].children[2].style.display = "block"
              bigger_post.children[0].children[0].children[0].src = post2.data().profile_pic
              bigger_post.children[0].children[0].children[1].innerHTML = post2.data().user_display_name
              bigger_post.children[0].children[1].innerHTML = post2.data().description
              bigger_post.children[0].children[2].src = post2.data().media
            }
          })
          getDocs(q2)
            .then( (snapshot) => {
              snapshot.docs.forEach((doc) => {
                allcomments.push({...doc.data(), id: doc.id})
              })

              let commentElmnt = null

              if(allcomments.length != 0){
                bigger_post_no_comments.style.display = "none"
                allcomments.forEach( (comment) =>{
                commentElmnt = createPosts(`
    
                  <div class="comment" style="display:'flex block';" >
                    <img src= ${comment.user_pic}  alt="Profile logo" />
                    <div>
                      <p class="comment_name3"> ${comment.username} </p>
                      <p class="comment_text3"> ${comment.comment} </p>
                    </div>
                  </div>
                  `)
                  bigger_post_comments.appendChild(commentElmnt);
              })          
            }

            })
        
      })
    })



  })



}

////////////////////////////////////////////////////////////////////////////////
