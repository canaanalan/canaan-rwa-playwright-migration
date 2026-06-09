import React from "react";
import { Container, Typography } from "@mui/material";

import CanaanMigrationLogo from "./CanaanMigrationLogo";

export default function Footer() {
  return (
    <Container maxWidth="sm" style={{ marginTop: 50 }}>
      <Typography variant="body2" color="textSecondary" align="center">
        Migrated by
        <CanaanMigrationLogo size="footer" style={{ marginLeft: 6 }} />
      </Typography>
    </Container>
  );
}
