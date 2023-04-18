import { useSession, signIn, signOut } from "next-auth/react"
import {Avatar, Button, Chip, IconButton, Menu, MenuItem, Tooltip, Typography} from "@mui/material";
import {useState} from "react";
export default function LogIn() {
  const { data: session } = useSession()
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };


  if (session) {
    return (
      <div>
        <Chip label="cloud sync on" color="primary"/>
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 3 }}>
            <Avatar alt={session.user.name} src={session.user.image} />
          </IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: '45px' }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <MenuItem>
            <Typography textAlign="center">Signed in as {session.user.name}#{session.user.discord_profile.discriminator}</Typography>
          </MenuItem>
          <MenuItem onClick={() => signOut()}>
            <Typography textAlign="center">Log Out</Typography>
          </MenuItem>
        </Menu>
      </div>
    )
  }
  return (
    <div>
      <Button
        variant="contained"
        sx={{ ml: 3 }}
        onClick={() => signIn("discord")}
      >Discord Sign in</Button>
    </div>
  )
}