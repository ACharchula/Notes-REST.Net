import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom';
import '../../App.css';
import Axios from 'axios';
import moment from 'moment';

const api = 'https://localhost:5001/notes';

class NotesMenu extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            notes: [],
            categories: [],
            fromFilter: '',
            toFilter: '',
            categoryFilter: 'All',
            currentPage: 0,
            allPages: 0
        }

        this.setFromFilter = this.setFromFilter.bind(this);
        this.setToFilter = this.setToFilter.bind(this);
        this.setCategoryFilter = this.setCategoryFilter.bind(this);
        this.filter = this.filter.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }

    componentDidMount() {
        const category = this.category();
        const from = this.from();
        const to = this.to();
        const currentPage = this.currentPage();

        this.getNotes(from, to, category, currentPage);
    }

    from() {
        return localStorage.getItem('fromFilter');
    }

    to() {
        return localStorage.getItem('toFilter');
    }

    currentPage() {
        return localStorage.getItem('currentPage');
    }

    category() {
        return localStorage.getItem('categoryFilter');
    }

    getNotes(from, to, category, page) {
        Axios.get(`${api}/all_notes?page=${page}&category=${category}&from=${from}&to=${to}`).then(res => {
            console.log(res.data.data.notes)
            this.setState({
                notes: res.data.data.notes,
                categories: res.data.data.categories,
                currentPage: res.data.data.pager.currentPage,
                allPages: res.data.data.pager.totalPages,
                fromFilter: from,
                toFilter: to,
                categoryFilter: category
            })
            localStorage.setItem('categoryFilter', category);
            localStorage.setItem('fromFilter', from);
            localStorage.setItem('toFilter', to);
            localStorage.setItem('currentPage', res.data.data.pager.currentPage);

            if (category !== 'All' && !res.data.data.categories.includes(category)) {
                this.getNotes(from, to, 'All', 1)
            }
        }).catch(err => {
            console.log(err);
        })
    }

    delete(id) {
        Axios.delete(`${api}/${id}`).then(res => {
            if (res.data !== 'Deleted') {
                alert(res.data)
            } else {
                this.getNotes(this.from(), this.to(), this.category(), this.currentPage());
            }
        }).catch(err => {
            console.log(err);
        })
    }


    setFromFilter(event) {
        if (event.target.value !== undefined) {
            this.setState({fromFilter: event.target.value})
        }
    }

    setToFilter(event) {
        if (event.target.value !== undefined) {
            this.setState({toFilter: event.target.value})
        }
    }

    setCategoryFilter(event) {
        if (event.target.value !== undefined) {
            this.setState({categoryFilter: event.target.value})
        }
    }

    filter(event) {
        event.preventDefault();

        if ((this.state.fromFilter === '' && this.state.toFilter !== '') || (this.state.fromFilter !== '' && this.state.toFilter === '')) {
            alert('Please insert both dates (from and to) or keep both empty.')
        } else if (this.state.fromFilter !== '' && !moment(this.state.fromFilter, 'YYYY-MM-DD').isSameOrBefore(moment(this.state.toFilter, 'YYYY-MM-DD'))) {
            alert("Please insert 'from' date which is before or equals 'to' date")
        } else {
            this.getNotes(this.state.fromFilter, this.state.toFilter, this.state.categoryFilter, 1);
        }
    }

    cancel() {
        this.getNotes('','', 'All', 1);
    }

    previousPage() {
        this.getNotes(this.from(), this.to(), this.category(), this.state.currentPage-1);
    }

    nextPage() {
        this.getNotes(this.from(), this.to(), this.category(), this.state.currentPage+1);
    }

    render() {
        return (
            <div className="App-Container container">
                <form onSubmit={this.filter}>
                    <div className="row padding-top">
                        <div className="form-inline form-group col-md-3">
                            <span className="px-2">From:</span>
                            <input className="form-control" type="date" value={this.state.fromFilter} onChange={this.setFromFilter}/>
                        </div>
                        <div className="form-inline form-group col-md-3">
                            <span className="px-2">To:</span>
                            <input className="form-control" type="date" value={this.state.toFilter} onChange={this.setToFilter}/>
                        </div>

                        <div className="form-inline form-group col-md-3">
                            <span className="px-2">Category:</span>
                            <select name="category" className="form-control" value={this.state.categoryFilter} onChange={this.setCategoryFilter}>
                                <option>All</option>
                                {
                                    this.state.categories.map( (name, index) => {
                                        return <option key={index} value={name}>{name}</option>
                                    })
                                }
                            </select>
                        </div>

                        <div className="form-inline form-group col-md-3">
                            <button type="submit" className="btn btn-secondary margin-right">Filter</button>
                            <button type="button" className="btn btn-secondary" onClick={() => this.cancel()}>Cancel</button>
                        </div>
                    </div>
                </form>

                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th className="col-width"></th>
                        </tr>
                    </thead>
                    <tbody>
                            {
                                this.state.notes.map( (note) => {
                                    return (<tr key={note.title}>
                                        <td>{moment(note.date).format('YYYY-MM-DD')}</td>
                                        <td>{note.title}</td>
                                        <td>
                                            <Link to={`/notes/edit/${note.noteID}`}>
                                                <button type="button" className="btn btn-outline-secondary margin-right">Edit</button>
                                            </Link>
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => this.delete(note.noteID)}>Delete</button>
                                        </td>
                                    </tr>)
                                })
                            }
                    </tbody>
                </table>
                <div className="footer">
                    <Link to={'/notes/create'}>
                        <button type="button" className="btn margin-bottom btn-primary">Create</button>
                    </Link>
                    <ul className="to-right pagination">
                        <li className="page-item"><button type="button" disabled={this.state.currentPage === 1} className="page-link" onClick={() => this.previousPage()}>Previous</button></li>
                        <li className="page-item page-link">{this.state.currentPage}/{this.state.allPages}</li>
                        <li className="page-item"><button type="button" disabled={this.state.currentPage === this.state.allPages} className="page-link" onClick={() => this.nextPage()}>Next</button></li>
                    </ul>
                </div>
            </div>

            
        )
    }
}

export default NotesMenu