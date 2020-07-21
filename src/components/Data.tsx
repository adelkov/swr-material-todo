import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import useSWR, {mutate} from 'swr'
import {Box, Chip, LinearProgress, Typography, Button, Card} from "@material-ui/core";
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

type todo = {
    completed: boolean
    title: string
    id: number
}

const REFRESH_INTERVAL = 10000;

export default function SimpleTable() {
    const classes = useStyles();

    const [userId, setUserId] = useState<number>(0);
    const [edit, setEdit] = useState<{ title: string, editing: boolean }>({editing: false, title: ""});


    const {data: user} = useSWR(userId ? '/users/' + userId : null);
    const {data: todos} = useSWR(() => '/todos?userId=' + user.id, {refreshInterval: REFRESH_INTERVAL});


    return (
        <>
            <Box display={"flex"} alignItems={"center"}>
                <TextField
                    variant={"outlined"}
                    autoFocus={true}
                    value={userId}
                    onChange={(e) => setUserId(+e.target.value)}
                    label="User ID"
                    type="number"
                    InputProps={{inputProps: {min: 0, max: 10}}}
                />
                {!userId && (
                    <Alert severity={"info"}>
                        Select user by ID to show their todos
                    </Alert>
                )}
                <Button
                    variant={'outlined'}
                    color={'primary'}
                    onClick={() => {
                        // tell all SWRs with this key to revalidate
                        mutate('/users/' + userId)
                    }}>
                    Revalidate
                </Button>
                {edit.editing ?
                    <form
                        onSubmit={() => {
                            mutate("/todos?userId=" + userId, [{title: edit.title, id: 0, completed: false}].concat([...todos]), false)
                            setEdit({editing: false, title: ""})
                        }}
                        noValidate autoComplete="off">
                        <TextField
                            label={"new todo"}
                            autoFocus={true}
                            variant={'outlined'}
                            color={'primary'}
                            onBlur={() => {
                                if (edit.title) return;
                                setEdit({...edit, editing: false})
                            }}
                            value={edit.title}
                            onChange={(e) => {
                                setEdit({...edit, title: e.target.value})
                            }}
                        />
                    </form>
                    :
                    <Button
                        variant={'outlined'}
                        color={'primary'}
                        onClick={() => {
                            setEdit({...edit, editing: true})
                        }}
                    >
                        Add new todo
                    </Button>}
            </Box>
            {user && (
                <Typography variant={"h6"} color={"secondary"}>
                    Todos of {user.name}
                </Typography>
            )}
            {todos && <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Todo</TableCell>
                            <TableCell align={"center"}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {todos.map((row: todo) => (
                            <TableRow key={row.title}>
                                <TableCell component="th" scope="row">
                                    {row.id}
                                </TableCell>
                                <TableCell>{row.title}</TableCell>
                                <TableCell align={"center"}>
                                    <Chip
                                        label={row.completed ? "Done" : "In Progress"}
                                        variant={row.completed ? "default" : "outlined"}
                                        color={row.completed ? "primary" : "secondary"}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>}
            {!todos && userId ? <LinearProgress color="primary"/> : null}
        </>
    );
}
