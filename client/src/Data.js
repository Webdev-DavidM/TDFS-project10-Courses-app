import config from './config';

// This is the app which makes all the calls to the api and returns the data to the statetful components which have requested it so they can hole the data in their own state and use it re re render the component. The data component is is held in state by the context app so each componentn can access it via context

export default class Data {
  // This api method abstracts way the various options used to fetch from an api.

  api(
    path,
    method = 'GET',
    body = null,
    requiresAuth = false,
    credentials = null
  ) {
    const url = config.apiBaseUrl + path;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    };

    if (body !== null) {
      options.body = JSON.stringify(body);
    }

    if (requiresAuth) {
      const encodedCredentials = btoa(
        `${credentials.username}:${credentials.password}`
      );
      options.headers['Authorization'] = `Basic ${encodedCredentials}`;
    }
    return fetch(url, options);
  }

  // Below are all the various methods to make calls to the api and handle the responses, the response is handed back to the method which called it in the component so the data can be added to state and the component re rendered. Any errors are dealt with her as well and error messages passed back.

  async getUser(username, password) {
    const response = await this.api(`/users`, 'GET', null, true, {
      username,
      password,
    });
    if (response.status === 200) {
      return response.json().then((data) => data);
    } else if (response.status === 401) {
      return null;
    } else {
      throw new Error();
    }
  }

  async deleteCourse(courseId, user) {
    const response = await this.api(
      `/courses/${courseId}`,
      'DELETE',
      null,
      true,
      user
    );
    if (response.status === 204) {
      return [];
    } else if (response.status === 401) {
      return response.json().then((data) => {
        return data.message;
      });
    } else {
      throw new Error();
    }
  }

  async createCourse(course, user) {
    let response = await this.api('/courses', 'POST', course, true, user);
    if (response.status === 201) {
      return null;
    } else if (response.status === 400) {
      response = await response.json();
      return response;
    }

    throw new Error();
  }

  async updateCourse(course, user) {
    let response = await this.api(
      `/courses/${course.id}`,
      'PUT',
      course,
      true,
      user
    );
    if (response.status === 204) {
      return response;
    }
    if (response.status === 404) {
      return response.json().then((response) => {
        response.errors = 'no such course';
        return response;
      });
    }
    if (response.status === 400) {
      response = await response.json();
      return response;
    }
  }

  async getCourse(id) {
    const response = await this.api(`/courses/${id}`, 'GET', null, false, null);
    if (response.status === 200) {
      return response.json().then((data) => data);
    } else if (response.status === 404) {
      response.error = ' cant find this course';
      return response;
    } else {
      throw new Error();
    }
  }

  async createUser(user) {
    const response = await this.api('/users', 'POST', user);
    if (response.status === 201) {
      return null;
    } else if (response.status === 400) {
      return response.json().then((data) => {
        return data.message;
      });
    } else {
      throw new Error();
    }
  }
}
