import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import axios from 'axios';
import moment from 'moment';

const api = 'https://localhost:5001/notes';

class NoteEditor extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            title: '',
            date: moment().format('YYYY-MM-DD'),
            markdown: false,
            content: '',
            categories: [],
            category: '',
            oldID: this.props.match.params.id || ''
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleMarkdownChange = this.handleMarkdownChange.bind(this);
        this.handleContentChange = this.handleContentChange.bind(this);
        this.handleCategoryInputChange = this.handleCategoryInputChange.bind(this);
        this.addCategory = this.addCategory.bind(this);
        this.removeCategory = this.removeCategory.bind(this);
    }

    componentDidMount() {
        if (this.state.oldID !== '') {
            axios.get(`${api}/${this.state.oldID}`).then(res => {
                const categories = res.data.note.categories[0] === '' ? [] : res.data.note.categories;
                const markdownBoolean = res.data.note.isMarkdown === 1;
                console.log(res.data)
                this.setState({
                    title: res.data.note.title,
                    date: moment(res.data.note.date).format('YYYY-MM-DD'),
                    categories: categories,
                    markdown: markdownBoolean,
                    content: res.data.note.description
                })
            }).catch(err => {
                console.log(err);
            })
        }
    }

    handleTitleChange(event) {
        this.setState({title: event.target.value})
    }

    handleDateChange(event) {
        this.setState({date: event.target.value})
    }

    handleMarkdownChange(event) {
        this.setState({markdown: event.target.checked})
    }

    handleContentChange(event) {
        this.setState({content: event.target.value})
    }

    handleCategoryInputChange(event) {
        this.setState({category: event.target.value})
    }

    addCategory() {
        const categories = this.state.categories;
        const category = this.state.category
        if (category !== '' && !categories.includes(category)) {
            categories.push(category);
            this.setState({
                category: '',
                categories: categories
            });
        } else {
            alert('Cannot add empty or already existing category!');
            this.setState({
                category: '',
            });
        }
    }

    removeCategory() {
        const categories = this.state.categories;
        const category = this.state.category;
        if (category !== '' && categories.includes(category)) {
            categories.splice(categories.indexOf(category), 1);
            this.setState({
                category: '',
                categories: categories 
            });
        } else {
            alert('Cannot remove empty or not existing category!');
            this.setState({
                category: ''
            });
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        
        if (this.state.title === '') {
            alert('Title cannot be empty!');
            return;
        } else if (this.state.date === '') {
            alert('Date cannot be empty!');
            return;
        }

        const markdownShort = this.state.markdown ? 1 : 0;
        if (this.props.mode === 'create') {
            axios.post(`${api}/save_note`, {
                Title: this.state.title,
                Date: this.state.date,
                isMarkdown: markdownShort,
                Description: this.state.content,
                Categories: this.state.categories
            }).then(res => {
                if (res.data !== 'Saved') {
                    alert(res.data)
                } else {
                    this.props.history.push('/');
                }
            }).catch(err => {
                console.log(err);
            })
        } else if (this.props.mode === 'edit') {
            axios.put(`${api}/update_note/${this.state.oldID}`, {
                title: this.state.title,
                date: this.state.date,
                markdown: markdownShort,
                content: this.state.content,
                categories: this.state.categories
            }).then(res => {
                if (res.data !== 'Updated') {
                    alert(res.data)
                } else {
                    this.props.history.push('/');
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }

    render() {
        return (
            <div className="App-Container container padding-top">
                <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="form-inline form-group col-md-5">
                        <label className="control-label px-2">Title of the note:</label>
                        <input type="text" value={this.state.title} onChange={this.handleTitleChange} className="form-control"/>
                    </div>
                    <div className="form-inline form-group col-md-3">
                        <label className="control-label px-2">Date:</label>
                        <input className="form-control" value={this.state.date} onChange={this.handleDateChange} type="date"/>
                    </div>
                    <div className="form-group form-inline col-md-2">
                        <div className="form-check">
                            <input className="form-check-input" checked={this.state.markdown} onChange={this.handleMarkdownChange} type="checkbox"/>
                            <label className="form-check-label" >Markdown</label>
                        </div>
                    </div>
                </div>
                
                <textarea value={this.state.content} className="form-control" onChange={this.handleContentChange} rows="8"/>

               
            <div className="row">
                
                <div className="col-md-4">
                    <ul className="list-group categories">
                        {this.state.categories.map( (name, index) => {
                        return <li className="list-group-item" key={index}>{name}</li>
                        })}
                    </ul>
                </div>
                
                <div className="form-group form-inline col-md-8">
                    <label className="control-label px-2">Category name:</label>
                    <input type="text" value={this.state.category} className="form-control" id="category" onChange={this.handleCategoryInputChange}/>
     
                    <button type="button" className="margin-left btn btn-outline-secondary" onClick={this.addCategory}>Add</button>
                    <button type="button" className="margin-left btn btn-outline-secondary" onClick={this.removeCategory}>Remove</button>
        
                </div>
            
            </div>
        

                <div className="form-group padding-top padding-bottom">
                    <button type="submit" id="Submit" className="btn btn-primary margin-right">Submit</button>
                    <Link to={'/'}>
                        <button type="button" className="btn btn-secondary">Cancel</button>
                    </Link>
                </div>

                </form>
            </div>
        )
    }
}

export default withRouter(NoteEditor);