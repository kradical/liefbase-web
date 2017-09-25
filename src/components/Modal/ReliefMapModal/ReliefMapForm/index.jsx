import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field, SubmissionError } from 'redux-form';

import { hideModal } from '../../../../redux/ui/modal';
import {
  create as createMap,
  update as updateMap,
} from '../../../../redux/entities/reliefMaps';

import {
  Button,
  Form,
} from 'semantic-ui-react';

import SemanticUiField from '../../../SemanticReduxFormField';

const FORM_NAME = 'reliefMap';

const reliefMapForm = {
  form: FORM_NAME,
  validate: (values) => {
    const errors = {};

    if (!values.name) {
      errors.name = "This field is required.";
    }

    return errors;
  }
};

const mapStateToProps = state => {
  const id = state.ui.modal.updateMapId;
  const map = state.entities.reliefMaps[id] || {};
  const { name, description } = map;

  return {
    id,
    initialValues: {
      name,
      description,
    }
  };
};

@connect(mapStateToProps)
@reduxForm(reliefMapForm)
export default class ReliefMapForm extends Component {
  static propTypes = {
    // mapStateToProps
    id: PropTypes.number,

    // redux-form
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    submitFailed: PropTypes.bool,
  };

  handleSubmit = async (values, dispatch) => {
    const id = this.props.id;
    const newValues = {
      ...values,
      id,
    };
    const action = id ? updateMap : createMap;

    try {
      await dispatch(action(newValues));
      dispatch(hideModal());
    } catch (err) {
      const errors = {};

      if (err.response) {
        Object.keys(err.response.data).forEach(k => errors[k] = err.response.data[k].join('\n'));
      }

      throw new SubmissionError({ ...errors, _error: 'Map request failed.' });
    }
  }

  render = () =>
    <Form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
      <Form.Field>
        <Field
          component={SemanticUiField}
          as={Form.Input}
          type="text"
          name="name"
          placeholder="Example Map"
          label="Name"
      />
      </Form.Field>
      <Form.Field>
        <Field
          component={SemanticUiField}
          as={Form.TextArea}
          name="description"
          placeholder="A short map description."
          label="Description"
      />
      </Form.Field>
      <Button
        type="submit"
        color="blue"
        disabled={this.props.submitting}
      >
        Submit
      </Button>
    </Form>
}
