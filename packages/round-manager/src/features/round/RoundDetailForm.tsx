import { useContext } from "react"

import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import Datetime from "react-datetime"
import "react-datetime/css/react-datetime.css"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { Round } from "../api/types"
import { FormContext } from "../common/FormWizard"
import { Input } from "../common/styles"


const ValidationSchema = yup.object().shape({
  metadata: yup.object({
    name: yup.string()
      .required("This field is required.")
      .min(8, "Round name must be less that 8 characters."),
  }),
  applicationStartTime: yup.date().required("This field is required."),
  startTime: yup.date()
    .required("This field is required.")
    .min(
      yup.ref("applicationStartTime"),
      "Round start date must be later than application start date"
    ),
  endTime: yup.date()
    .min(yup.ref("startTime"), "Round end date must be later than the round start date")
})


export function RoundDetailForm(props: { initialData: any, stepper: any }) {
  const { currentStep, setCurrentStep, stepsCount, formData, setFormData } = useContext(FormContext)
  const { control, register, handleSubmit, formState: { errors } } = useForm<Round>({
    defaultValues: formData,
    resolver: yupResolver(ValidationSchema),
  })

  const FormStepper = props.stepper

  const next: SubmitHandler<Round> = async (values) => {
    const data = { ...formData, ...values }
    setFormData(data)
    setCurrentStep(currentStep + 1)
  }
  const prev = () => setCurrentStep(currentStep - 1)

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <p className="text-base leading-6"><b>Details</b></p>
          <p className="mt-1 text-base text-gray-500">Use a permanent address where you can receive mail.</p>
          {(!props.initialData.programId || (!props.initialData.program && props.initialData.isProgramFetched)) &&
            <div className="mt-5">
              <span className="text-rose-600">Error: Missing or invalid Program ID!</span><br />
              <Link to="/" className="text-blue-600 underline">Please choose a Grant Program</Link>
            </div>
          }
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2  border border-grey-100 px-6 pt-6 pb-3.5">
          <form onSubmit={handleSubmit(next)}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="name" className="block text-xs font-medium text-gray-700">Round Name</label>
                <Input
                  {...register("metadata.name")}
                  $hasError={errors.metadata?.name}
                  type="text"
                />
                {errors.metadata?.name && <p className="text-sm text-red-600">{errors.metadata?.name?.message}</p>}
              </div>
            </div>

            <p className="mt-6">What are the dates for the Applications and Round voting period(s)</p>

            <p className="text-xs mt-4 mb-2">Applications</p>
            <div className="grid grid-cols-6 gap-6 mb-1">
              <div className={`col-span-6 sm:col-span-3 relative border rounded-md px-3 py-2 shadow-sm focus-within:ring-1 ${errors.applicationStartTime ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500" : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"}`}>
                <label htmlFor="applicationStartTime" className="block text-[10px]">Start Date</label>
                <Controller
                  control={control}
                  name="applicationStartTime"
                  render={({ field }) => (
                    <Datetime
                      {...field}
                      closeOnSelect
                      inputProps={{
                        placeholder: "",
                        className: "block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm"
                      }}
                    />
                  )} />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            {errors.applicationStartTime && <p className="text-sm text-red-600">{errors.applicationStartTime?.message}</p>}

            <p className="text-xs mt-4 mb-2">Round</p>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <div className={`relative border rounded-md px-3 py-2 shadow-sm focus-within:ring-1 ${errors.startTime ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500" : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"}`}>
                  <label htmlFor="startTime" className="block text-[10px]">Start Date</label>
                  <Controller
                    control={control}
                    name="startTime"
                    render={({ field }) => (
                      <Datetime
                        {...field}
                        closeOnSelect
                        inputProps={{
                          placeholder: "",
                          className: "block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm"
                        }}
                      />
                    )} />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.startTime && <p className="text-sm text-red-600">{errors.startTime?.message}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <div className={`relative border rounded-md px-3 py-2 shadow-sm focus-within:ring-1 ${errors.endTime ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500" : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"}`}>
                  <label htmlFor="endTime" className="block text-[10px]">End Date</label>
                  <Controller
                    control={control}
                    name="endTime"
                    render={({ field }) => (
                      <Datetime
                        {...field}
                        closeOnSelect
                        inputProps={{
                          placeholder: "",
                          className: "block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm"
                        }}
                      />
                    )} />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.endTime && <p className="text-sm text-red-600">{errors.endTime?.message}</p>}
              </div>
            </div>
            <FormStepper
              currentStep={currentStep}
              stepsCount={stepsCount}
              prev={prev}
            />
          </form>
        </div>
      </div>
    </div>
  )
}