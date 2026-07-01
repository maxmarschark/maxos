import { useMemo, useRef, useState } from "react"
import { Upload, AlertTriangle } from "lucide-react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Textarea } from "../../../components/ui/Textarea"
import { Select } from "../../../components/ui/Select"
import { Badge } from "../../../components/ui/Badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table"
import { parseCsvText, rowsToContacts } from "../csv"
import { detectImportDuplicates } from "../duplicates"
import { getContactName } from "../utils"

export function CsvImportModal({
  open,
  onClose,
  onImport,
  accounts,
  brands,
  existingContacts,
}) {
  const fileRef = useRef(null)
  const [csvText, setCsvText] = useState("")
  const [fileName, setFileName] = useState("pasted-import.csv")
  const [parseResult, setParseResult] = useState(null)
  const [duplicateActions, setDuplicateActions] = useState({})

  const previewContacts = useMemo(() => {
    if (!parseResult?.rows?.length) return []
    return rowsToContacts(parseResult.rows, accounts, brands).map((c) => ({
      ...c,
      fullName: getContactName(c),
    }))
  }, [parseResult, accounts, brands])

  const duplicates = useMemo(() => {
    if (previewContacts.length === 0) return []
    return detectImportDuplicates(previewContacts, existingContacts, accounts)
  }, [previewContacts, existingContacts, accounts])

  const duplicateIndexSet = useMemo(
    () => new Set(duplicates.map((d) => d.index)),
    [duplicates]
  )

  const importCount = useMemo(() => {
    return previewContacts.filter((_, index) => {
      if (!duplicateIndexSet.has(index)) return true
      return (duplicateActions[index] ?? "skip") !== "skip"
    }).length
  }, [previewContacts, duplicateIndexSet, duplicateActions])

  function handleParse(text, name) {
    setCsvText(text)
    if (name) setFileName(name)
    setParseResult(parseCsvText(text))
    setDuplicateActions({})
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => handleParse(String(ev.target?.result ?? ""), file.name)
    reader.readAsText(file)
  }

  function handleClose() {
    setCsvText("")
    setFileName("pasted-import.csv")
    setParseResult(null)
    setDuplicateActions({})
    if (fileRef.current) fileRef.current.value = ""
    onClose()
  }

  function setDuplicateAction(index, action) {
    setDuplicateActions((prev) => ({ ...prev, [index]: action }))
  }

  function handleImport() {
    if (previewContacts.length === 0) return

    const items = previewContacts.map((contact, index) => {
      const dup = duplicates.find((d) => d.index === index)
      if (dup?.targetId) {
        return { ...contact, _duplicateTargetId: dup.targetId }
      }
      if (dup) {
        return { ...contact, _isInFileDuplicate: true }
      }
      return contact
    })

    onImport({
      fileName,
      items,
      duplicateActions,
    })
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Contacts"
      description="Upload a CSV or paste contact data. Duplicates are detected automatically."
      size="lg"
      className="max-w-3xl"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={importCount === 0}>
            Import {importCount > 0 ? `${importCount} ` : ""}Contacts
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => fileRef.current?.click()}
          >
            Upload CSV File
          </Button>
          {fileName && parseResult && (
            <span className="ml-3 text-xs text-zinc-500">{fileName}</span>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-zinc-500">Or paste CSV data</p>
          <Textarea
            value={csvText}
            onChange={(e) => handleParse(e.target.value, "pasted-import.csv")}
            placeholder={`first name,last name,company,brand,role,phone,email,city,state,notes\nJane,Smith,Green Leaf Dispensary,NOKO,Buyer,(512) 555-0100,jane@example.com,Austin,TX,Sample contact`}
            className="min-h-[100px] font-mono text-xs"
          />
        </div>

        {parseResult?.errors?.length > 0 && (
          <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-3 py-2">
            {parseResult.errors.map((err) => (
              <p key={err} className="text-xs text-amber-400">
                {err}
              </p>
            ))}
          </div>
        )}

        {duplicates.length > 0 && (
          <div className="rounded-lg border border-amber-900/50 bg-amber-950/10 p-3 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle size={14} />
              <p className="text-sm font-medium">
                {duplicates.length} duplicate{duplicates.length !== 1 ? "s" : ""} detected
              </p>
            </div>
            <div className="max-h-40 overflow-auto space-y-2">
              {duplicates.map((dup) => {
                const canReplaceMerge = Boolean(dup.targetId)
                const action = duplicateActions[dup.index] ?? "skip"
                return (
                  <div
                    key={dup.index}
                    className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 p-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-200">{getContactName(dup.contact)}</p>
                      <p className="text-xs text-zinc-500">
                        {dup.reasons.join(" · ")}
                        {dup.existingMatches[0] &&
                          ` · matches ${getContactName(dup.existingMatches[0])}`}
                      </p>
                    </div>
                    <Select
                      value={action}
                      onChange={(e) => setDuplicateAction(dup.index, e.target.value)}
                      className="w-full sm:w-32"
                    >
                      <option value="skip">Skip</option>
                      {canReplaceMerge && <option value="replace">Replace</option>}
                      {canReplaceMerge && <option value="merge">Merge</option>}
                    </Select>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {parseResult && (
          <div>
            <p className="mb-2 text-sm text-zinc-400">
              Preview — {previewContacts.length} row{previewContacts.length !== 1 ? "s" : ""},{" "}
              {importCount} will be imported
            </p>
            {previewContacts.length > 0 ? (
              <div className="max-h-48 overflow-auto rounded-lg border border-zinc-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewContacts.slice(0, 10).map((c, i) => {
                      const isDup = duplicateIndexSet.has(i)
                      const action = duplicateActions[i] ?? "skip"
                      return (
                        <TableRow key={i}>
                          <TableCell>{c.fullName}</TableCell>
                          <TableCell>{c.company || "—"}</TableCell>
                          <TableCell className="text-zinc-400">{c.email || "—"}</TableCell>
                          <TableCell>
                            {isDup ? (
                              <Badge variant={action === "skip" ? "warning" : "primary"}>
                                {action === "skip" ? "Duplicate" : action}
                              </Badge>
                            ) : (
                              <Badge variant="success">New</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {previewContacts.length > 10 && (
                  <p className="border-t border-zinc-800 px-3 py-2 text-xs text-zinc-600">
                    + {previewContacts.length - 10} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-600">
                No valid rows found. Include a header row with columns like name, email, phone,
                company, or brand.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
