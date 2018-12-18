var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var auth = require('./routes/auth');
var api = require('./routes/api');
var cors = require('cors');
var app = express();

app.use(cors({origin:true,credentials: true}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// IMPORT ORDER !! use middleware first then use routers.
// https://stackoverflow.com/questions/39796228/req-session-is-undefined-using-express-session
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { path: '/', httpOnly: true, secure: false, maxAge: null }
}));

// Router must be started from below session declare.
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', auth);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;


