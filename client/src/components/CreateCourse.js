import React, { Component } from 'react';

export default class CreateCourse extends Component {
  state = {
    title: '',
    description: '',
    estimatedTime: '',
    materialsNeeded: '',
    errors: null,
  };

  // the method below handles any user inputs and adds it to state
  //latest update 17.39 //

  change = (event) => {
    let { name } = event.target;
    let { value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  // Below the submit method collates all the auth user information and the course information and sends them across the createCourse method which makes the api request

  submit = (event) => {
    event.preventDefault();
    this.setState({
      errors: null,
    });
    const { password, emailAddress } = this.props.context.authenticatedUser;
    let username = emailAddress;
    let user = { password, username };
    let userId = this.props.context.authenticatedUser.id;
    let { title, description, estimatedTime, materialsNeeded } = this.state;
    let course = { title, description, estimatedTime, materialsNeeded, userId };
    this.props.context.data.createCourse(course, user).then((errors) => {
      console.log(errors);
      if (errors) {
        this.setState({ errors: errors.message });
      } else {
        this.props.history.push('/');
      }
    });
  };

  cancel = (event) => {
    this.props.history.push('/');
  };

  render() {
    // Any validation errors are rendered below to the page.
    let { firstName, lastName } = this.props.context.authenticatedUser;
    let errors = this.state.errors;
    return (
      <div className="bounds course--detail">
        <h1>Create Course</h1>
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
          <form onSubmit={this.submit}>
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
                    value={this.state.value}
                    onChange={this.change}
                  />
                </div>
                <p>
                  by {firstName} {lastName}
                </p>
              </div>
              <div className="course--description">
                <div>
                  <textarea
                    id="description"
                    name="description"
                    className=""
                    placeholder="Course description..."
                    value={this.state.value}
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
                        placeholder="Hours"
                        value={this.state.value}
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
                        placeholder="List materials..."
                        value={this.state.value}
                        onChange={this.change}
                      ></textarea>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="grid-100 pad-bottom">
              <button className="button" type="submit">
                Create Course
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={this.cancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
