import { Trash2, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { BiasParams, CarSetupParams } from "../../consts/params";
import { AllPossibleSetups } from "../../consts/setup";
import { GameVersions, trackMap, TrackOrders } from "../../consts/tracks";
import { validateSetupArray } from "../../consts/validator";
import { updateSlot } from "../../libs/reducers/configReducer";
import { arrayFloatEqual, biasToSetup, eps, nearestSetup, randomSetup, setupToBias } from "../../libs/setup";
import { ClearFeedbackDialog } from "./ClearFeedbackDialog";
import { FeedbackCycle } from "./FeedbackCycle";
import { FeedbackMark, FeedbackMarkProvider } from "./FeedbackMark";
import { HtmlTooltip } from "../Tooltip";
import { Button } from "../ui/Button";
import { Select, SelectItem } from "../ui/Select";
import { Slider } from "../ui/Slider";
import { Panel, ScrollArea } from "../ui/Table";
import { DataTable } from "../ui/DataTable";
import { OtpInput } from "../ui/OtpInput";

const shortAlphabet = "ogdb+-u12345 ";

const feedbackShortMapping = {
  "optimal": "o",
  "great": "g",
  "good": "d",
  "bad": "b",
  "bad+": "+",
  "bad-": "-",
  "unknown": "u",
}


const feedbackShortUnmapping = {
  "o": "optimal",
  "g": "great",
  "d": "good",
  "b": "bad",
  "+": "bad+",
  "-": "bad-",
  "u": "unknown",

  "1": "optimal",
  "2": "great",
  "3": "good",
  "4": "bad",
  "5": "unknown",

  " ": "unknown",
}


export function Calculator({ slot }) {

  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [carSetupList, setCarSetupList] = useState([]);
  const [possibleSetups, setPossibleSetups] = useState(AllPossibleSetups);
  const [openClearFeedback, setOpenClearFeedback] = useState(false);


  const update = (payload) => dispatch(updateSlot({
    id: slot.id, payload
  }));

  let {
    gameVersion, track, carSetup,
    prevCarSetup, feedback, previousRuns,
  } = slot;

  if (!gameVersion) gameVersion = "2022";

  const seasonTrackOrders = TrackOrders[gameVersion];


  if (
    slot.id && !(
      validateSetupArray(carSetup) &&
      validateSetupArray(prevCarSetup) &&
      feedback && track && previousRuns
    )
  ) {
    update({
      carSetup: [0.5, 0.5, 0.5, 0.5, 0.5],
      prevCarSetup: [0.5, 0.5, 0.5, 0.5, 0.5],
      feedback: [[], [], [], [], []],
      track: "XX",
      previousRuns: [],
    });
  }


  const biasParam = setupToBias(carSetup);
  const prevBiasParam = setupToBias(prevCarSetup);
  const isValidSetup = CarSetupParams.map(p => {
    try {
      const val = carSetup ? carSetup[p.index] : 0.5;
      if (val < -1e-6 || val >= 1+1e-6) {
        return false;
      }
      const roundValue = val * (p.max - p.min) / p.step;
      return Math.abs(Math.round(roundValue) - roundValue) <= 1e-6;
    } catch {
      update({
        carSetup: [0.5, 0.5, 0.5, 0.5, 0.5],
        prevCarSetup: [0.5, 0.5, 0.5, 0.5, 0.5],
        feedback: [[], [], [], [], []],
        track: "XX",
        previousRuns: [],
      });
    }
  });

  const createFeedback = (idx, biasValue, v) => {

    const matchedRuns = previousRuns.filter(x => (
      x.track === track &&
      arrayFloatEqual(x.carSetup, carSetup)
    ))

    if (v === "unknown") {
      // setLastCarSetup(carSetup)
      update({
        previousRuns: matchedRuns.length ? (
          previousRuns.map(x => x.id === matchedRuns[0].id ? {
            ...x,
            ["feedback_" + idx]: null,
          } : x)
        ) : ([{
          track,
          carSetup: JSON.parse(JSON.stringify(carSetup)),
          ["feedback_" + idx]: null,
          id: +new Date(),
        }, ...previousRuns]),
        feedback: feedback.map((x, i) => idx === i ? x.filter(x => x.value !== biasValue): x),
      });
    } else {
      // setLastCarSetup(carSetup)
      update({
        previousRuns: matchedRuns.length ? (
          previousRuns.map(x => x.id === matchedRuns[0].id ? {
            ...x,
            ["feedback_" + idx]: {
              value: biasValue,
              timestamp: +new Date(),
              feedback: v
            },
          } : x)
        ) : ([{
          track,
          carSetup: JSON.parse(JSON.stringify(carSetup)),
          ["feedback_" + idx]: {
            value: biasValue,
            timestamp: +new Date(),
            feedback: v
          },
          id: +new Date(),
        }, ...previousRuns]),
        feedback: feedback.map((x, i) => idx === i ? [
          ...x.filter(x => x.value !== biasValue), {
            value: biasValue,
            timestamp: +new Date(),
            feedback: v
          }
        ]: x),
      });
    }
  }

  const currentTrack = trackMap[track];

  const currentFeedbacks = [0, 1, 2, 3, 4].map(i => {
    for(const fb of feedback[i]) {
      if (fb.value === biasParam[i]) {
        return fb.feedback;
      }
    }
    return "unknown";
  })

  const currentShortFeedbacks = currentFeedbacks.map(x => feedbackShortMapping[x])

  const setShortFeedbacks = (_val) => {
    const val = _val.toLowerCase();
    [0, 1, 2, 3, 4].map(i => {
      if (val[i] && (currentShortFeedbacks[i] !== val[i])) {
        createFeedback(i, biasParam[i], feedbackShortUnmapping[val[i]])
      }
    })
  }

  const setCarSetup = (carSetup) => {
    update({ carSetup });
  }

  const findNearest = () => {
    update({
      prevCarSetup: carSetup,
    });

    const {setup, possibleSetups, lowestRuleBreak, possibleSetupList} = nearestSetup(
      biasParam,
      feedback,
      [[0,1],[0,1],[0,1],[0,1],[0,1]], // currentTrack.perfectSetups, // , //
      [[0,1],[0,1],[0,1],[0,1],[0,1]], // currentTrack.perfectEffects, // , //
    )

    if (setup) {
      if (lowestRuleBreak > 0) {
        enqueueSnackbar(
          'Unable to find a valid setup matching all feedbacks. This is the closest we could get.',
          { variant: "warning" }
        );
        setPossibleSetups(0);
      } else {
        setPossibleSetups(possibleSetups);
      }
      setCarSetup(setup);
      setCarSetupList(possibleSetupList);
    } else {
      enqueueSnackbar(
        'Unable to find a valid setup matching all feedbacks. Try deleting some feedbacks.',
        { variant: "error" }
      );
    }
  }

  const clearFeedbacks = () => {
    update({ feedback: [[], [], [], [], []] });
    setPossibleSetups(AllPossibleSetups);
  }

  const nextTrack = () => {
    let t = seasonTrackOrders.indexOf(track) + 1;
    // t = 0: not found
    if (t >= seasonTrackOrders.length) {
      t = 0; // 0 if unspecified is included
    }
    setPossibleSetups(AllPossibleSetups);
    const trackId = seasonTrackOrders[t];
    update({track: trackId});
    setCarSetup(trackMap[trackId].setup);
  }

  const optimalAndNext = () => {
    const pr = {
      track,
      carSetup: JSON.parse(JSON.stringify(carSetup)),
      feedback_0: "optimal",
      feedback_1: "optimal",
      feedback_2: "optimal",
      feedback_3: "optimal",
      feedback_4: "optimal",
      id: +new Date(),
    };

    for(let i=0; i<5; i++) {
      pr["feedback_" + i] = {
        value: biasParam[i],
        timestamp: +new Date(),
        feedback: "optimal"
      }
    }

    update({
      previousRuns: [pr, ...previousRuns],
    });
    clearFeedbacks();
    nextTrack();
  }


  const loadPreset = () => setCarSetup(currentTrack.setup);

  return (
    <div key={slot.slotNaming} className="pt-3">
      <ClearFeedbackDialog clear={() => {
        clearFeedbacks();
        loadPreset();
      }} isOpen={openClearFeedback} setIsOpen={setOpenClearFeedback} />

      <FeedbackMarkProvider delayDuration={60}>
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">

        {/* ===================== SETUP PANEL ===================== */}
        <Panel className="[&>*:last-child]:border-b-0">
          {/* Game + Track selectors */}
          <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3 border-b border-line px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Game:</span>
              <Select value={gameVersion} ariaLabel="Game" onValueChange={(v) => update({ gameVersion: v })} className="h-9">
                {GameVersions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Track:</span>
              <Select
                value={track}
                ariaLabel="Track"
                placeholder="Select track"
                className="h-9 min-w-[200px]"
                onValueChange={(selectedTrack) => {
                  if (trackMap.hasOwnProperty(selectedTrack)) {
                    update({ track: selectedTrack });
                    setOpenClearFeedback(true);
                  }
                }}
              >
                {seasonTrackOrders.map(tid => trackMap[tid]).map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <Image src={require(`../../assets/flags/${t.id}.svg`)} width={24} height={18} alt={t.country} />
                      <span>{t.name}, {t.country}</span>
                    </span>
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Random / Preset / Next Track / Optimal actions */}
          <div className="flex flex-wrap gap-2 border-b border-line px-3 py-2.5">
            <Button variant="danger" onClick={() => setCarSetup(randomSetup())}>Random</Button>
            <Button variant="secondary" onClick={loadPreset}>Load Preset</Button>
            <Button variant="success" onClick={nextTrack}>Next Track</Button>
            <Button variant="primary" onClick={optimalAndNext}>Optimal & Next</Button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[110px_1fr_84px] gap-2 border-b border-line px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:grid-cols-[150px_1fr_96px]">
            <div>Setup</div>
            <div>Values</div>
            <div className="text-right">Compare</div>
          </div>

          {/* Setup rows */}
          {CarSetupParams.map(row => {
            let carSetupDiff = carSetup[row.index] - prevCarSetup[row.index];
            if (Math.abs(carSetupDiff) < eps) {
              carSetupDiff = 0;
            }
            const perfectRange = currentTrack.perfectSetups[row.index];
            const sliderColor =
              (carSetup[row.index] > 1 || carSetup[row.index] < 0) ? "danger"
                : (isValidSetup[row.index] ? "primary" : "warning");
            return (
              <div key={row.name} className="grid grid-cols-[110px_1fr_84px] items-center gap-2 border-b border-line/60 px-3 py-1.5 sm:grid-cols-[150px_1fr_96px]">
                <div>
                  <div className="font-bold">{row.name}</div>
                  {currentTrack.perfectSetups[row.index][1] <= 1 && (
                    <div
                      className="text-[13px]"
                      style={{ color: carSetup[row.index] - eps > perfectRange[1] || carSetup[row.index] + eps < perfectRange[0] ? "#ffaa00" : "#77ff77" }}
                    >
                      <Image
                        src={require(`../../assets/flags/${currentTrack.id}.svg`)}
                        width={22} height={15} alt={currentTrack.country}
                        className="calc-hint-flag"
                      />
                      <span style={{ lineHeight: "15px", verticalAlign: "middle" }}>
                        {row.render(perfectRange[0] * (row.max - row.min) + row.min)}~{row.render(perfectRange[1] * (row.max - row.min) + row.min)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <Slider
                    marks
                    color={sliderColor}
                    step={row.step / (row.max - row.min)}
                    max={Math.max(1, carSetup[row.index])}
                    min={Math.min(0, carSetup[row.index])}
                    format={v => row.render(v * (row.max - row.min) + row.min)}
                    value={carSetup[row.index]}
                    onValueChange={(value) => {
                      const setup = carSetup.map((x, idx) => idx === row.index ? (
                        Math.round(value * 560) / 560
                      ) : x);
                      setCarSetup(setup);
                    }}
                  />
                </div>
                <div className="text-right text-sm">
                  <div style={{ color: carSetupDiff > 0 ? "#ff6383" : carSetupDiff < 0 ? "#76ff03" : "white" }}>
                    {carSetupDiff > 0 ? "▲" : carSetupDiff < 0 ? "▼" : ""} {row.render(carSetup[row.index] * (row.max - row.min) + row.min)}
                  </div>
                  <div className="text-zinc-500">Prev: {row.render(prevCarSetup[row.index] * (row.max - row.min) + row.min)}</div>
                </div>
              </div>
            );
          })}
        </Panel>

        {/* ===================== FEEDBACK PANEL ===================== */}
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-3 py-2.5">
            <HtmlTooltip
              title={
                <div>
                  <div className="font-semibold text-zinc-100">Quick Input</div>
                  <em>Use <b>these shortcuts</b> to input the feedbacks quicker.</em>
                  <table className="mt-1">
                    <thead>
                      <tr><th>short</th><th>meaning</th><th>number</th></tr>
                    </thead>
                    <tbody>
                      <tr><th>o</th><td><u>o</u>ptimal</td><th>1</th></tr>
                      <tr><th>g</th><td><u>g</u>reat</td><th>2</th></tr>
                      <tr><th>d</th><td>goo<u>d</u></td><th>3</th></tr>
                      <tr><th>b</th><td><u>b</u>ad</td><th>4</th></tr>
                      <tr><th>u</th><td><u>u</u>nknown</td><th>5</th></tr>
                    </tbody>
                  </table>
                  <span>Additionally, +/- for bad(+)/(-).</span>
                </div>
              }
            >
              <div>
                <OtpInput
                  length={5}
                  value={currentShortFeedbacks}
                  onChange={v => setShortFeedbacks(v)}
                  validateChar={(ch) => shortAlphabet.indexOf(ch.toLowerCase()) !== -1}
                />
              </div>
            </HtmlTooltip>
            <Button variant="warning" onClick={() => clearFeedbacks()}>Clear Feedbacks</Button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[88px_104px_1fr] gap-3 border-b border-line px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <div />
            <div>Feedback</div>
            <div>Bias</div>
          </div>

          {/* Bias rows */}
          {BiasParams.map(row => {
            let feedbacks = JSON.parse(JSON.stringify(feedback[row.index]));
            const biasValue = biasParam[row.index];
            return (
              <div key={row.name + ":" + slot.slotNaming} className="grid grid-cols-[88px_104px_1fr] items-center gap-3 border-b border-line/60 px-3 py-2.5">
                <div className="font-bold">{row.name}</div>
                <FeedbackCycle
                  value={currentFeedbacks[row.index]}
                  disabled={!isValidSetup.every(x => x)}
                  onChange={(v) => createFeedback(row.index, biasValue, v)}
                />
                <div className="px-1">
                  <Slider
                    max={1}
                    step={0.000001}
                    min={0}
                    color="primary"
                    format={v => v.toFixed(6)}
                    value={biasParam[row.index]}
                    valueMarks={feedbacks.map((f, _idx) => ({
                      key: _idx,
                      value: f.value,
                      content: (
                        <FeedbackMark
                          fb={f}
                          onClick={() => {
                            const bias = biasParam.map((x, idx) => idx === row.index ? f.value : x);
                            setCarSetup(biasToSetup(bias));
                          }}
                        />
                      ),
                    }))}
                    onValueChange={(value) => {
                      const bias = biasParam.map((x, idx) => idx === row.index ? value : x);
                      setCarSetup(biasToSetup(bias));
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Find Setup — terminal action of the feedback flow */}
          <div className="flex flex-wrap items-center gap-3 border-t border-line p-3">
            <span className="text-sm text-zinc-500">{possibleSetups} Possibilities</span>
            <Button variant="primary" size="lg" className="ml-auto" onClick={findNearest}>
              Find Setup →
            </Button>
          </div>
        </Panel>

        {/* ===================== RESULTS GRID ===================== */}
        <div className="lg:col-span-2">
          <DataTable
            initialPageSize={20}
            pageSizeOptions={[20, 50, 100]}
            rows={[
              {
                arr: prevCarSetup,
                biasParams: setupToBias(prevCarSetup),
                diff: 0,
                id: 0,
              },
              ...carSetupList.map((x, id) => {
                const biasParams = setupToBias(x.arr);
                return { ...x, biasParams, id: id + 1 };
              })
            ]}
            columns={[
              {
                field: 'id', headerName: 'Setup #',
                renderCell: ({ row, value }) =>
                  <Button variant={value ? "info" : "secondary"} size="sm" className="min-w-[64px]" onClick={() => setCarSetup(row.arr)}>
                    {value ? "#" + value : "PRV"}
                  </Button>
              },
              {
                field: 'diff', headerName: '%',
                valueGetter: ({ value }) => value.toFixed(1) + "%",
              },
              ...CarSetupParams.map(param => {
                const idx = param.index;
                return {
                  field: 'arr_' + idx,
                  headerName: param.name,
                  valueGetter: ({ row }) => row.arr ? row.arr[idx] : 0,
                  renderCell: ({ row }) => {
                    const value = row.arr ? row.arr[idx] : 0;
                    const carSetupDiff = value - (prevCarSetup ? prevCarSetup[idx] : 0);
                    return <span style={{ color: carSetupDiff > 0 ? "#ff6383" : carSetupDiff < 0 ? "#76ff03" : "white" }}>
                      {carSetupDiff > 0 ? "▲" : carSetupDiff < 0 ? "▼" : ""} {param.render(value * (param.max - param.min) + param.min)}
                    </span>
                  },
                }
              }),
              {
                field: 'arr', headerName: '⇒',
                width: 24,
                renderCell: () => "⇒",
              },
              ...BiasParams.map(param => {
                const idx = param.index;
                return {
                  field: 'biasArr_' + idx,
                  headerName: param.name,
                  valueGetter: ({ row }) => row.biasParams ? row.biasParams[idx] : 0,
                  renderCell: ({ row }) => {
                    const value = row.biasParams ? row.biasParams[idx] : 0;
                    const carSetupDiff = value - (prevBiasParam ? prevBiasParam[idx] : 0);
                    return <span style={{ color: carSetupDiff > 0 ? "#ff6383" : carSetupDiff < 0 ? "#76ff03" : "white" }}>
                      {value.toFixed(4)} {carSetupDiff > 0 ? "▲" : carSetupDiff < 0 ? "▼" : ""}
                    </span>
                  },
                }
              })
            ]}
          />
        </div>

        {/* ===================== PREVIOUS RUNS ===================== */}
        <div className="lg:col-span-2">
          <Panel>
            <ScrollArea>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="px-2 py-2.5 text-left">Previous Runs</th>
                    {["FWA", "RWA", "ARD", "TC", "TO", "Oversteer", "Braking", "Cornering", "Traction", "Straights"].map(h => (
                      <th key={h} className="px-1.5 py-2.5 text-center">{h}</th>
                    ))}
                    <th className="px-2 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {previousRuns.map(x => (
                    <tr key={x.id} className="border-b border-line/50">
                      <td className="whitespace-nowrap px-2 py-1.5">
                        <span className="flex items-center gap-2">
                          <Image src={require(`../../assets/flags/${x.track}.svg`)} width={24} height={20} alt={x.track} />
                          <span>{trackMap[x.track]?.name}</span>
                        </span>
                      </td>
                      {[0, 1, 2, 3, 4].map(idx => (
                        <td key={idx} className="px-1.5 py-1.5 text-center">
                          {CarSetupParams[idx].render(
                            x.carSetup[idx] * (CarSetupParams[idx].max - CarSetupParams[idx].min) + CarSetupParams[idx].min
                          )}
                        </td>
                      ))}
                      {[0, 1, 2, 3, 4].map(idx => (
                        <td key={idx} className="px-1.5 py-1.5 text-center">
                          <FeedbackMark fb={x["feedback_" + idx]} />
                        </td>
                      ))}
                      <td className="px-2 py-1.5">
                        <div className="flex flex-row-reverse gap-1.5">
                          <Button variant="info" size="icon" onClick={() => setCarSetup(x.carSetup)} aria-label="Load setup">
                            <ExternalLink size={16} />
                          </Button>
                          <Button variant="danger" size="icon" onClick={() => {
                            update({ previousRuns: previousRuns.filter(r => r.id !== x.id) });
                          }} aria-label="Delete run">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </Panel>
        </div>
      </div>
      </FeedbackMarkProvider>
    </div>
  )
}

export default dynamic(() => Promise.resolve(Calculator), {
  ssr: false,
});
