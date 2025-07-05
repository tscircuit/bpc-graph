import corpus from "@tscircuit/schematic-corpus"
import { useMemo, useState } from "react"
import { Assignment2Debugger } from "./Assignment2Debugger"

const floatingGraph = corpus.design001
const fixedGraph = corpus.design018

export default function Assignment2Page() {
  return (
    <Assignment2Debugger
      floatingGraph={floatingGraph!}
      fixedGraph={fixedGraph!}
    />
  )
}
