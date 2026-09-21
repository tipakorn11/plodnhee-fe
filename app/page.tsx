"use client";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import {
  Add,
  CameraAlt,
  CheckCircle,
  Delete,
  Search,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
type Person = {
  id: string;
  name: string;
  email: string;
  amount: number;
  bills: number;
  photo?: string;
};
type Group = {
  id: string;
  name: string;
  emoji: string;
  people: string[];
  total: number;
};
const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});
const theme = createTheme({
  palette: {
    primary: { main: "#315c4f" },
    secondary: { main: "#dff0c2" },
    background: { default: "#f8f9f7" },
  },
  typography: {
    fontFamily: "Arial",
    h3: { fontFamily: "Georgia", fontWeight: 700 },
    h5: { fontFamily: "Georgia", fontWeight: 700 },
  },
});
const seed: Person[] = [
  {
    id: "1",
    name: "Mina Park",
    email: "mina@example.com",
    amount: 1240,
    bills: 2,
  },
  {
    id: "2",
    name: "James Wong",
    email: "james@example.com",
    amount: 750,
    bills: 1,
  },
  {
    id: "3",
    name: "Avery Stone",
    email: "avery@example.com",
    amount: 420,
    bills: 1,
  },
  { id: "4", name: "Noah Bell", email: "", amount: 0, bills: 0 },
];
const seedGroups: Group[] = [
  {
    id: "1",
    name: "Bangkok getaway",
    emoji: "✈️",
    people: ["1", "2", "3"],
    total: 2410,
  },
  { id: "2", name: "Friday dinner", emoji: "🍜", people: ["1", "4"], total: 0 },
];
export default function Home() {
  const [people, setPeople] = useState(seed),
    [groups, setGroups] = useState(seedGroups),
    [gid, setGid] = useState("1"),
    [dialog, setDialog] = useState<"person" | "group" | "payment" | null>(null),
    [search, setSearch] = useState(""),
    [message, setMessage] = useState(""),
    [photo, setPhoto] = useState<string>();
  const file = useRef<HTMLInputElement>(null);
  const group = groups.find((g) => g.id === gid)!;
  const visible = useMemo(
    () =>
      people.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [people, search],
  );
  const total = people.reduce((s, p) => s + p.amount, 0);
  const tell = (x: string) => {
    setMessage(x);
    setTimeout(() => setMessage(""), 3000);
  };
  const choosePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPhoto(URL.createObjectURL(f));
  };
  function addPerson(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      name = String(f.get("name")).trim(),
      amount = Number(f.get("amount"));
    if (!name || !amount) return;
    setPeople((x) => [
      ...x,
      {
        id: crypto.randomUUID(),
        name,
        email: String(f.get("email")),
        amount,
        bills: 1,
        photo,
      },
    ]);
    setPhoto(undefined);
    setDialog(null);
    tell(`${name} was added.`);
  }
  function addGroup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      name = String(f.get("name")).trim(),
      people = f.getAll("people") as string[];
    if (!name || !people.length) return;
    const id = crypto.randomUUID();
    setGroups((x) => [
      ...x,
      { id, name, emoji: String(f.get("emoji")) || "👥", people, total: 0 },
    ]);
    setGid(id);
    setDialog(null);
    tell("Group created.");
  }
  function addPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      id = String(f.get("person")),
      amount = Number(f.get("amount"));
    if (!amount) return;
    setPeople((x) =>
      x.map((p) =>
        p.id === id
          ? { ...p, amount: p.amount + amount, bills: p.bills + 1 }
          : p,
      ),
    );
    setGroups((x) =>
      x.map((g) => (g.id === gid ? { ...g, total: g.total + amount } : g)),
    );
    setDialog(null);
    tell("Payment assigned.");
  }
  function remove(p: Person) {
    if (!p.bills) return;
    setPeople((x) =>
      x.map((a) =>
        a.id === p.id
          ? {
              ...a,
              bills: a.bills - 1,
              amount:
                a.bills === 1
                  ? 0
                  : Math.round((a.amount * (a.bills - 1)) / a.bills),
            }
          : a,
      ),
    );
    tell(`One bill removed from ${p.name}.`);
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          p: { xs: 2, md: 6 },
          maxWidth: 1250,
          mx: "auto",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          alignItems={{ sm: "center" }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              OVERVIEW
            </Typography>
            <Typography variant="h3">People & payments</Typography>
            <Typography color="text.secondary">
              Keep track of what your people owe you.
            </Typography>
          </Box>
          <Button
            size="large"
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialog("person")}
          >
            Add person
          </Button>
        </Stack>
        <Card
          sx={{
            mt: 4,
            p: 3,
            bgcolor: "secondary.main",
            backgroundImage: "none",
          }}
        >
          <Stack direction="row" spacing={{ xs: 3, md: 7 }} alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">
                TOTAL OUTSTANDING
              </Typography>
              <Typography variant="h4" color="primary.dark">
                {fmt.format(total)}
              </Typography>
              <Typography variant="caption">
                Across {people.filter((p) => p.amount > 0).length} people
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="body2" color="text.secondary">
                ACTIVE GROUPS
              </Typography>
              <Typography variant="h4" color="primary.dark">
                {groups.length}
              </Typography>
              <Typography variant="caption">Split expenses your way</Typography>
            </Box>
          </Stack>
        </Card>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="end"
          sx={{ mt: 5, mb: 2 }}
        >
          <Box>
            <Typography variant="h5">Your groups</Typography>
            <Typography variant="body2" color="text.secondary">
              Assign bills to the groups you care about.
            </Typography>
          </Box>
          <Button startIcon={<Add />} onClick={() => setDialog("group")}>
            New group
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 4 }}>
          {groups.map((g) => (
            <Card
              key={g.id}
              variant="outlined"
              sx={{
                minWidth: 245,
                borderColor: g.id === gid ? "primary.main" : "divider",
              }}
            >
              <CardActionArea onClick={() => setGid(g.id)} sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar variant="rounded" sx={{ bgcolor: "#eff4eb" }}>
                    {g.emoji}
                  </Avatar>
                  <Box flex={1}>
                    <Typography fontWeight={700}>{g.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {g.people.length} people · {fmt.format(g.total)}
                    </Typography>
                  </Box>
                </Stack>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          alignItems={{ sm: "center" }}
        >
          <Box>
            <Typography variant="h5">{group.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {group.people.length} people in this group
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialog("payment")}
          >
            Assign payment
          </Button>
        </Stack>
        <Paper variant="outlined" sx={{ mt: 2, overflow: "hidden" }}>
          <Box
            sx={{
              p: 1.5,
              px: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <TextField
              size="small"
              variant="standard"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Typography variant="caption" alignSelf="center">
              {visible.length} people
            </Typography>
          </Box>
          <List disablePadding>
            {visible.map((p) => (
              <ListItem
                key={p.id}
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box textAlign="right" sx={{ minWidth: 92 }}>
                      <Typography variant="caption" color="text.secondary">
                        {p.amount ? "Owes you" : "Settled up"}
                      </Typography>
                      <Typography
                        fontWeight={700}
                        color={p.amount ? "#a35c3e" : "#5c9278"}
                      >
                        {p.amount ? (
                          fmt.format(p.amount)
                        ) : (
                          <CheckCircle fontSize="small" />
                        )}
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      disabled={!p.bills}
                      onClick={() => remove(p)}
                      title="Remove one bill"
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar src={p.photo}>{p.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={p.name}
                  secondary={p.email || "No email added"}
                />
                <Chip
                  label={`${p.bills} ${p.bills === 1 ? "bill" : "bills"}`}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 16 }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
        {message && (
          <Alert
            severity="success"
            sx={{ position: "fixed", right: 24, bottom: 24, boxShadow: 3 }}
          >
            {message}
          </Alert>
        )}
        <Dialog
          open={dialog !== null}
          onClose={() => setDialog(null)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>
            {dialog === "person"
              ? "Add someone who owes you"
              : dialog === "group"
                ? "Create a group"
                : `Add a bill to ${group.name}`}
          </DialogTitle>
          <Box
            component="form"
            onSubmit={
              dialog === "person"
                ? addPerson
                : dialog === "group"
                  ? addGroup
                  : addPayment
            }
          >
            <DialogContent>
              <Stack spacing={2}>
                {dialog === "person" && (
                  <>
                    <Box
                      onClick={() => file.current?.click()}
                      sx={{ cursor: "pointer", width: 76, height: 76 }}
                    >
                      <Avatar
                        src={photo}
                        sx={{
                          width: 76,
                          height: 76,
                          bgcolor: "secondary.main",
                        }}
                      >
                        <CameraAlt />
                        <input
                          hidden
                          ref={file}
                          type="file"
                          accept="image/*"
                          onChange={choosePhoto}
                        />
                      </Avatar>
                    </Box>
                    <TextField required name="name" label="Name" />
                    <TextField
                      name="email"
                      label="Email (optional)"
                      type="email"
                    />
                    <TextField
                      required
                      name="amount"
                      label="Amount they need to pay"
                      type="number"
                      inputProps={{ min: 1 }}
                    />
                  </>
                )}
                {dialog === "group" && (
                  <>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        required
                        fullWidth
                        name="name"
                        label="Group name"
                      />
                      <TextField
                        name="emoji"
                        label="Icon"
                        defaultValue="👥"
                        sx={{ width: 90 }}
                      />
                    </Stack>
                    <Typography variant="subtitle2">Add people</Typography>
                    {people.map((p) => (
                      <FormControlLabel
                        key={p.id}
                        control={
                          <input type="checkbox" name="people" value={p.id} />
                        }
                        label={p.name}
                      />
                    ))}
                  </>
                )}
                {dialog === "payment" && (
                  <>
                    <TextField
                      select
                      required
                      name="person"
                      label="Person"
                      defaultValue={group.people[0]}
                    >
                      {people
                        .filter((p) => group.people.includes(p.id))
                        .map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name}
                          </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                      required
                      name="amount"
                      label="Amount"
                      type="number"
                      inputProps={{ min: 1 }}
                    />
                  </>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setDialog(null)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {dialog === "group"
                  ? "Create group"
                  : dialog === "person"
                    ? "Add person"
                    : "Assign payment"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
