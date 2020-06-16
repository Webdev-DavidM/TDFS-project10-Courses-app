import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Consumer } from './Context';

export default ({ component: Component, ...rest }) => {
  // this HOC private route component takes both the create course and update course components and make sures an authenticated user is signed in, otherwise directing them to sign up

  

  return (
    <Consumer>
      {(context) => (
        <Route
          {...rest}
          render={(props) =>
            context.authenticatedUser ? (
              <Component {...props} />
            ) : (
              <Redirect
                to={{
                  pathname: '/forbidden',
                  state: { from: props.location },
                }}
              />
            )
          }
        />
      )}
    </Consumer>
  );
};
