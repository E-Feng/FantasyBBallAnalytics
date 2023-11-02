import React from 'react';
import Select from 'react-select';

function MultiSelectCheckbox(props) {
  const reactSelectStyle = {
    control: (styles) => ({
      ...styles,
      background: 'white',
      color: 'black',
      width: '300px',
      minHeight: '1px',
      border: '1px solid grey',
    }),
    input: (styles) => ({
      ...styles,
      maxHeight: '17px',
      fontSize: 'revert',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen',
    }),
    placeholder: (styles) => ({
      ...styles,
      fontSize: '13px',
      maxHeight: '19px',
      paddingLeft: '5px',
    }),
    indicatorsContainer: (styles) => ({
      ...styles,
      display: 'flex',
      flexDirection: 'row',
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      height: '15px',
      width: '15px',
      padding: '0px',
      alignItems: 'center',
    }),
    clearIndicator: (styles) => ({
      ...styles,
      height: '15px',
      width: '15px',
      padding: '0px',
      alignItems: 'center',
    }),
    menu: (styles) => ({
      ...styles,
      border: '1px solid grey',
    }),
    option: (styles, state) => ({
      ...styles,
      color: 'black',
      fontSize: '14px',
      paddingLeft: '5px',
      background: state.isFocused
        ? '#0067a5'
        : state.isSelected
        ? 'darkgrey'
        : 'white',
    }),
  };

  return (
    <Select
      isMulti
      options={props.options}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      controlShouldRenderValue={false}
      placeholder={'Select Teams...'}
      onChange={props.handleChange}
      unstyled
      styles={reactSelectStyle}
    />
  );
}

export default MultiSelectCheckbox;
