const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();


app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secretKey = "s3cr3tk3y";

const generateJwt = (user) => {
  const payload = { username: user.username }
  return jwt.sign(payload, secretKey, { expiresIn: "1h"})
}

const authenticateJwt = (req, res, next) => {
  let authHeader = req.headers.authorization;
  if(authHeader ){
    let token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey,(err, user)=>{
      if(err){
        res.status(403).send()
      }else {
        req.user = user;
        next()
      }
    })
  } else {
    res.status(401).send()
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  let admin = req.body;
  let existingAdmin = ADMINS.find((e)=> e.username === admin.username)
  if(existingAdmin){
    res.status(403).json({ message: "Admin already exists"})
  }else{
    ADMINS.push(admin);
    let token = generateJwt(admin);
    res.json({ message: 'Admin created successfully', token: token })
  }
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  let {username, password} = req.headers;
  let admin = ADMINS.find((a)=> a.username === username && a.password === password)
  if(admin){
    let token = generateJwt(admin);
    res.json({ message: 'Logged in successfully', token: token })
  }else{
    res.status(403).json({ message : "Admin authentication failed"})
  }
});

let counter = 1;

app.post('/admin/courses', authenticateJwt, (req, res) => {
  // logic to create a course
  let course = req.body
  course.id = COURSES.length + 1;
  COURSES.push(course)
  res.json({message: "Course created sucessfully", courseId : course.id})
});

app.put('/admin/courses/:courseId', authenticateJwt, (req, res) => {
  // logic to edit a course
  let courseId = parseInt(req.params.courseId);
  let courseIndex = COURSES.findIndex((c)=> c.id === courseId);
  if(courseIndex > -1){
    let updatedCourse = {...COURSES[courseIndex], ...req.body}
    COURSES[courseIndex] = updatedCourse;
    res.status(201).json({ message: 'Course updated successfully' })
  }else {
    res.status(403).json({ message: "Course not found"})
  }
});

app.get('/admin/courses',authenticateJwt, (req, res) => {
  // logic to get all courses
  res.json(COURSES)
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  let user = req.body;
  let existingUser = USERS.find((u)=> u.username === user.username)
  if(existingUser){
    res.status(403).json({message: "User already exists"})
  }else {
    USERS.push({...user, purchesedCourse: []})
    const token = generateJwt(user)
    res.json({ message: 'User created successfully', token: token })
  }
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  let { username , password } = req.headers;
  let findUser = USERS.find((e)=> e.username === username && e.password === password);
  if(findUser){
    let token = generateJwt(findUser);
    res.json({ message: 'Logged in successfully', token: token })
  }else{
    res.status(403).json({message: "User authentication failed"})
  }
});

app.get('/users/courses',authenticateJwt, (req, res) => {
  // logic to list all courses
  let allPublishedCourses = COURSES.filter(c => c.published);
  res.json({courses: allPublishedCourses})
});

app.post('/users/courses/:courseId',authenticateJwt, (req, res) => {
  // logic to purchase a course
  let courseId = parseInt(req.params.courseId)
  let course = COURSES.filter(c => c.id === courseId && c.published)
  if(course){
    const user = USERS.find((u)=> u.username === req.user.username)
    if(user){
      if(!user.purchesedCourse){
        user.purchesedCourse = [];
      }
      user.purchesedCourse.push(course)
      res.json({ message: 'Course purchased successfully' })
    } else {
      res.status(403).json({message: "User not found"})
    }
  } else {
    res.status(403).json({message: "Course not found"})
  }
});

app.get('/users/purchasedCourses', authenticateJwt, (req, res) => {
  // logic to view purchased courses

  // let purchasedCourseIds = req.user.purchesedCourse;
  // let purchasedCourse = []
  // for(let i = 0 ; i < COURSES.length ; i++){
  //   if( purchasedCourseIds.indexOf(COURSES[i].id) !== -1){
  //     purchasedCourse.push(COURSES[i])
  //   }
  // }
  // res.json({purchasedCourse: purchasedCourse})


  let user = USERS.find(u=> u.username === req.user.username)
  if(user && user.purchesedCourse){
    res.json({purchesedCourse: user.purchesedCourse})
  } else {
    res.status(404).json({message: "No course found"})
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
