import { Loader2Icon } from "lucide-react"

const Loading = () => {
    return(
        <div className="flex-center min-h-96 h-full w-full">
            <Loader2Icon className="animate-spin size-9 text-green-950" />
        </div>
    )
}
export default Loading