import React, { Component } from "react";

export default class UpdateCourse extends Component {
  constructor() {
    super();
    this.state = {
      _id: null,
      title: "",
      description: "",
      estimatedTime: "",
      materialsNeeded: "",
      errors: "",
      user: "",
    };
  }

  updateCourse = (event) => {
    event.preventDefault();
    const { password, emailAddress } = this.props.context.authenticatedUser;
    let {
      _id,
      title,
      description,
      estimatedTime,
      materialsNeeded,
      user,
    } = this.state;

    let course = {
      _id,
      title,
      description,
      estimatedTime,
      materialsNeeded,
      user,
    };

    let username = emailAddress;
    this.props.context.data
      .updateCourse(course, { password, username })
      .then((response) => {
        if (response.message) {
          this.setState({ errors: response.message });
        } else {
          this.props.history.push("/");
        }
      });
  };

  componentDidMount = () => {
    this.courseToUpdate();
  };

  change = (event) => {
    let { name } = event.target;
    let { value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  cancel = (event) => {
    this.props.history.push("/");
  };

  courseToUpdate = async () => {
    let courseId = this.props.match.params.id;
    this.props.context.data.getCourse(courseId).then((response) => {
      if (!response.error) {
        let {
          _id,
          title,
          description,
          estimatedTime,
          materialsNeeded,
        } = response.course;

        // here we set state for the course and the owner
        this.setState({
          _id,
          title,
          description,
          estimatedTime,
          materialsNeeded,
          user: response.user,
        });
      } else {
        this.props.history.push("./notfound");
      }
    });
  };

  //This section will check if there the auth user Id not the same as the userId on the course and if so it will render the forbidden page. I am trying two methods below, one via component did update and other just comparing state

  componentDidUpdate() {
    let authId = this.props.context.authenticatedUser._id;
    if (this.state.user._id !== authId) {
      this.props.history.push("/forbidden");
    }
  }

  render() {
    let { firstName, lastName } = this.props.context.authenticatedUser;
    let { description, estimatedTime, materialsNeeded, title } = this.state;
    let errors = this.state.errors;
    return (
      <div className="bounds course--detail">
        <h1>Update Course</h1>
        <div>
          {errors && (
            <div>
              <h2 className="validation--errors--label">Validation errors</h2>
              <div className="validation-errors">
                <ul>
                  {errors.map((error, index) => {
                    return <li key={index}>{error}</li>;
                  })}
                </ul>
              </div>
            </div>
          )}
          <form onSubmit={this.updateCourse}>
            <div className="grid-66">
              <div className="course--header">
                <h4 className="course--label">Course</h4>
                <div>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className="input-title course--title--input"
                    placeholder="Course title..."
                    value={title}
                    onChange={this.change}
                  />
                </div>
                <p>
                  By {firstName} {lastName}
                </p>
              </div>
              <div className="course--description">
                <div>
                  <textarea
                    id="description"
                    name="description"
                    className=""
                    placeholder="...Description"
                    value={description}
                    onChange={this.change}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="grid-25 grid-right">
              <div className="course--stats">
                <ul className="course--stats--list">
                  <li className="course--stats--list--item">
                    <h4>Estimated Time</h4>
                    <div>
                      <input
                        id="estimatedTime"
                        name="estimatedTime"
                        type="text"
                        className="course--time--input"
                        placeholder="...estimated time  "
                        value={estimatedTime}
                        onChange={this.change}
                      />
                    </div>
                  </li>
                  <li className="course--stats--list--item">
                    <h4>Materials Needed</h4>
                    <div>
                      <textarea
                        id="materialsNeeded"
                        name="materialsNeeded"
                        className=""
                        placeholder="...materialsNeeded"
                        value={materialsNeeded}
                        onChange={this.change}
                      ></textarea>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="grid-100 pad-bottom">
              <button className="button" type="submit">
                Update Course
              </button>
              <button className="button button-secondary" onClick={this.cancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
