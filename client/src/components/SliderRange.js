import React from 'react';
import { Range, getTrackBackground } from 'react-range';

import styled from 'styled-components';

function SliderRange(props) {
  const values = props.weekRange;
  const setValues = props.setWeekRange;

  const STEP = 1;
  const MIN = 1;
  const MAX = props.max;
  const RTL = false;

  const handleChange = (values) => setValues(values);

  return (
    <Container>
      <Range
        values={values}
        step={STEP}
        min={MIN}
        max={MAX}
        rtl={RTL}
        onChange={handleChange}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: '36px',
              display: 'flex',
              width: '100%',
              backgroundColor: 'black',
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: '5px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values,
                  colors: ['#ccc', '#548BF4', '#ccc'],
                  min: MIN,
                  max: MAX,
                  RTL,
                }),
                alignSelf: 'center',
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '16px',
              width: '16px',
              borderRadius: '16px',
              backgroundColor: '#FFF',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0px 2px 6px #AAA',
            }}
          >
            <div
              style={{
                height: '14px',
                width: '14px',
                borderRadius: '14px',
                backgroundColor: isDragged ? '#548BF4' : '#CCC',
              }}
            />
          </div>
        )}
      />
      <Display>
        Week {values[0]} - Week {values[1]}
      </Display>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;

  width: 200px;
  margin: 0 1rem;
`;

const Display = styled.output`
  margin-top: -0.4rem;
`

export default SliderRange;
