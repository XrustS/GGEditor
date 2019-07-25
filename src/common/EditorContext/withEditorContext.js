import React from 'react';
import EditorContext from '@common/EditorContext';

export default function(WrappedComponent, mapStateToProps) {
  if (!mapStateToProps) {
    mapStateToProps = ({
      graph,
      executeCommand,
      setGraphState,
      graphState,
    }) => {
      return {
        graph,
        executeCommand,
        setGraphState,
        graphState,
      };
    };
  }

  class InjectEditorContext extends React.Component {
    render() {
      const { forwardRef, ...rest } = this.props;

      return (
        <EditorContext.Consumer>
          {context => {
            console.log('Context injected: ', context);
            return (
              <WrappedComponent
                ref={forwardRef}
                {...mapStateToProps(context)}
                {...rest}
              />
            );
          }}
        </EditorContext.Consumer>
      );
    }
  }

  return React.forwardRef((props, ref) => (
    <InjectEditorContext {...props} forwardRef={ref} />
  ));
}
