import {
  Grid,
  TextField,
  Button
} from '@mui/material';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';

const StyledGrid = styled(Grid)({
  paddingBottom: 8,
});

const Header = ({ serverInfo, setServerInfo }) => {

  return (
    <StyledGrid
      container
      justifyContent='center'
      spacing={2}
    >
      <Grid item xs={6}>
        <TextField
          label='Domain'
          value={serverInfo.domain}
          onChange={e => setServerInfo(cur => ({ ...cur, domain: e.target.value }))}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label='Token'
          value={serverInfo.token}
          onChange={e => setServerInfo(cur => ({ ...cur, token: e.target.value }))}
          fullWidth
        />
      </Grid>
    </StyledGrid>
  );
}

Header.propTypes = {
  serverInfo: PropTypes.object.isRequired,
  setServerInfo: PropTypes.func.isRequired
};

export default Header;
