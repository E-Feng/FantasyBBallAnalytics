import styled from "styled-components";

function SyncButton(props) {
  const updatedAt = Date.parse(props.updatedAt + 'Z');
  const now = Date.now();

  const onClick = () => {
    console.log("Syncing league data...");
  };

  return (
    <Button onClick={onClick}>
      &#8634; Sync
    </Button>
  );
}

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
`;

export default SyncButton;