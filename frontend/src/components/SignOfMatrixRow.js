import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const SOMSTATS = ({item}) => { 
    const [monday, setmonday] = useState("")
    const [tuesday, settuesday] = useState("")
    const [wednesday, setwednesday] = useState("")
    const [thursday, setthursday] = useState("")
    const [friday, setfriday] = useState("")

    const filters = useSelector((state) => state.filters);
    const queryStr = `dt=${filters.dt}&w=${filters.w}&m=${filters.m}&y=${filters.y}&pS=${filters.pS}&itemId=${item._id}`

    useEffect(() => {
        axios.get(
            `http://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}/som/getSomStats?${queryStr}`)
            .then((result) => {
              if (result.data.success) {
                const {monday,tuesday,wednesday,thursday,friday} = result.data.datesList
                setmonday(monday)
                settuesday(tuesday)
                setwednesday(wednesday)
                setthursday(thursday)
                setfriday(friday)
              }
            })
            .catch((err) => {
            });
          
            return () => {
                setmonday("")
                settuesday("")
                setwednesday("")
                setthursday("")
                setfriday("")
            }
    }, [item])

    return (
      <>
      <td colspan="1" rowspan="1">
          <p>&nbsp;{monday==""?"...":monday}</p>
        </td>
        <td colspan="1" rowspan="1">
          <p>&nbsp;{tuesday==""?"...":tuesday}</p>
        </td>
        <td colspan="1" rowspan="1">
          <p>&nbsp;{wednesday==""?"...":wednesday}</p>
        </td>
        <td colspan="1" rowspan="1">
          <p>&nbsp;{thursday==""?"...":thursday}</p>
        </td>
        <td colspan="1" rowspan="1">
          <p>&nbsp;{friday==""?"...":friday}</p>
        </td>
      </>
    )
  }

export default SOMSTATS