const express = require('express');
const app = express();


app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

let adminAuthentication = (req, res, next) => {
  let { username, password} = req.headers;
  let admin = ADMINS.find((a)=> a.username === username && a.password === password)
  if(admin){
    next()
  } else {
    res.status(403).json({ message : "Admin authentication failed"})
  }
}

let userAuthentication = (req, res, next)=>{
  let { username, password } = req.headers;
  let user = USERS.find((u)=> u.username === username && u.password === password);
  if(user){
    req.user = user;
    next()
  }else{
    res.status(403).json({message: "User authentication failed"})
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  
  let admin = req.body;
  let adminExists = ADMINS.find((a)=> a.username === admin.username);
  if(adminExists){
    res.status(403).json({ message: "Admin already exists"})
  }else {
    ADMINS.push(admin)
    res.json({message : "Admin created sucessfully!"})
  }
});

app.post('/admin/login', adminAuthentication, (req, res) => {
  // logic to log in admin
    res.status(404).send({message: 'Logged in successfully'})

});

app.post('/admin/courses', adminAuthentication, (req, res) => {
  // logic to create a course
  let course = req.body;

  if(!course.title){
    res.status(411).json({msg: "Course should have a title "})
  }

  console.log(Date.now())

  course.id = Date.now();

  let courseExists = COURSES.find((a)=> a.title === course.title);

  if(courseExists){
    res.status(403).json({msg: "Course is already exists"})
  }else{
    COURSES.push(course)
    res.json({msg: "Course sucessfully created!", courseId: course.id})
  }
});

app.put('/admin/courses/:courseId',adminAuthentication, (req, res) => {
  // logic to edit a course
  let courseId = parseInt(req.params.courseId)
  let course = COURSES.find((a)=> a.id === courseId)

  if(course){
    Object.assign(course, req.body)
    res.json({msg : "Course Update sucessfully"})
  } else{
    res.status(404).json({msg: "Course not found!"})
  }

}); 

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
  res.json(COURSES)
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = { ...req.body, purchasedCourse: []}
  USERS.push(user);
  res.json({message: "User created successfully"})
});

app.post('/users/login',userAuthentication, (req, res) => {
  // logic to log in user
  res.json({ message: 'Logged in successfully' })
});

app.get('/users/courses',userAuthentication, (req, res) => {
  // logic to list all courses
  res.json(COURSES)
});

app.post('/users/courses/:courseId',userAuthentication, (req, res) => {
  // logic to purchase a course
  let courseId = parseInt(req.params.courseId)
  let course = COURSES.find((c)=> c.id === courseId && c.published)
  if(course){
    req.user.purchasedCourse.push(courseId)
    res.json({ message: 'Course purchased successfully' })
  }else {
    res.status(403).json({message: "Sorry the course is not Available"})
  }
});

app.get('/users/purchasedCourses',userAuthentication, (req, res) => {
  // logic to view purchased courses
  let purchasedCourseIds = req.user.purchasedCourse;
  let purchasedCourses = []
  for(let i = 0 ; i< COURSES.length; i++){
    if( purchasedCourseIds.indexOf(COURSES[i].id) !== -1){
      purchasedCourses.push(COURSES[i])
    }
  }
  res.json({purchasedCourses})
});

// app.use((req, res)=>{
//   res.status(404).send
// })

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
