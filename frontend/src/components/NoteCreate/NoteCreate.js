import React from 'react'
import '../../App.css';
import NoteEditor from '../NoteEditor/NoteEditor';

function NoteCreate() {
    return (
        <NoteEditor mode='create'/>
    )
}

export default NoteCreate