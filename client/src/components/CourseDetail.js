import React, { Component } from 'react';
import { Link } from 'react-router-dom';
const Markdown = require('react-markdown');

export default class CourseDetail extends Component {
  constructor() {
    super();
    this.state = {
      course: [],
      owner: [],
    };
    this.selectedCourse = this.selectedCourse.bind(this);
    this.returnToList = this.returnToList.bind(this);
    this.deleteCourse = this.deleteCourse.bind(this);
  }

  // Once this page is loaded the componentDidMount method will trigger the selectedCourse method

  componentDidMount() {
    this.selectedCourse();
  }

  deleteCourse = () => {
    if (this.props.context.authenticatedUser) {
      const { password, emailAddress } = this.props.context.authenticatedUser;
      let username = emailAddress;
      let user = { password, username };
      let courseId = this.props.match.params.id;
      this.props.context.data.deleteCourse(courseId, user).then((errors) => {
        if (errors.length) {
          this.setState({ errors });
        } else this.props.history.push('/');
      });
    } else {
      this.props.history.push('/forbidden');
    }
  };

  selectedCourse = () => {
    let courseId = this.props.match.params.id;
    this.props.context.data.getCourse(courseId).then((response) => {
      if (!response.error) {
        this.setState({ course: response, owner: response.User });
      } else {
        this.props.history.push('/notfound');
      }
    });
  };

  // })
  // .catch((error) => {
  //   this.props.history.push('/notfound');
  // });

  returnToList() {
    this.props.history.push('/');
  }
  render() {
    // the conditional rendering below will only display the delete and update course button if the authenticated user owns the course. I have checked this by comparing the authenticatedUser email address with the owner email address and if they match then rendering the buttons.
    
    let authToChange = false;
    if (this.props.context.authenticatedUser) {
      let authUser = this.props.context.authenticatedUser.emailAddress;
      let Owner = this.state.owner.emailAddress;
      authToChange = Owner === authUser;
    }
    let course = this.state.course;
    let courseId = this.props.match.params.id;
    return (
      <div className="bounds course--detail">
        <div>
          <div className="actions--bar">
            <div className="bounds">
              <div className="grid-100">
                {authToChange && (
                  <span>
                    <div className="button">
                      <Link
                        style={{ color: 'white' }}
                        to={`/courses/${courseId}/update`}
                      >
                        Update Course
                      </Link>
                    </div>
                    <button
                      className="button"
                      onClick={() => this.deleteCourse()}
                    >
                      Delete Course
                    </button>
                  </span>
                )}

                <a className="button button-secondary" href="/">
                  Return to List
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-66">
          <div className="course--header">
            <h4 className="course--label">Course</h4>
            <h3 className="course--title">{course.title}</h3>
            <p>
              By {this.state.owner.firstName} {this.state.owner.lastName}
            </p>
          </div>
          <div className="course--description">
            <Markdown source={course.description} />
          </div>
        </div>
        <div className="grid-25 grid-right">
          <div className="course--stats">
            <ul className="course--stats--list">
              <li className="course--stats--list--item">
                <h4>Estimated Time</h4>
                <h3>{course.estimatedTime}</h3>
              </li>
              <li className="course--stats--list--item">
                <h4>Materials Needed</h4>
                <ul>
                  <Markdown source={course.materialsNeeded} />
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
