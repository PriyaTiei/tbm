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

    const getCell = (day) => {
      return (
        <td style={
          day=="OK"?{backgroundColor:"rgba(0, 255, 0, 0.7)"}:
          (day=="NG"?{backgroundColor:"rgba(255, 0, 0, 0.7)"}:{backgroundColor:"#cccccc"})
        } colspan="1" rowspan="1">
          <p>&nbsp;{day==""?"...":day}</p>
        </td>
      )
    }

    return (
      <>
        {
          getCell(monday)
        }
        {
          getCell(tuesday)
        }
        {
          getCell(wednesday)
        }
        {
          getCell(thursday)
        }
        {
          getCell(friday)
        }
      </>
    )
  }

export default SOMSTATS