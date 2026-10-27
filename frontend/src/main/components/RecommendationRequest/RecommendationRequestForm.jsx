import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function RecommendationRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  // For explanation, see: https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
  // Note that even this complex regex may still need some tweaks

  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  // Stryker restore Regex

  // Stryker disable Regex
  const boolean_regex = /^(true|false)$/; // Accepts lowercase true or false
  const email_regex = /^[1-9a-z](\.?[1-9a-z])*@[1-9a-z](\.?[1-9a-z])*$/i; // Accepts basic emails with names that have letters, numbers, and non-consecutive dots as long as it doesn't start or end either name with them. Must include a domain (e.g., @x.y). Ref: https://stackoverflow.com/questions/2049502/what-characters-are-allowed-in-an-email-address
  // Stryker restore Regex

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid="RecommendationRequestForm-id"
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
            <Form.Control
              data-testid={"RecommendationRequestForm-requesterEmail"}
              id="requesterEmail"
              type="text"
              isInvalid={Boolean(errors.requesterEmail)}
              {...register("requesterEmail", {
                required: true,
                maxLength: {
                  value: 100,
                },
                pattern: email_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requesterEmail?.type == "required" &&
                "RequesterEmail is required."}
              {errors.requesterEmail?.type == "maxLength" &&
                "Max RequesterEmail length is 100 characters."}
              {errors.requesterEmail?.type == "pattern" &&
                'RequesterEmail must include a domain with only letters, numbers, and non-consecutive dots between them, e.g., "freddy.fazbear.87@ucsb.edu".'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="professorEmail">Professor Email</Form.Label>
            <Form.Control
              data-testid={"RecommendationRequestForm-professorEmail"}
              id="professorEmail"
              type="text"
              isInvalid={Boolean(errors.professorEmail)}
              {...register("professorEmail", {
                required: true,
                maxLength: {
                  value: 100,
                },
                pattern: email_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.professorEmail?.type == "required" &&
                "ProfessorEmail is required."}
              {errors.professorEmail?.type == "maxLength" &&
                "Max ProfessorEmail length is 100 characters."}
              {errors.professorEmail?.type == "pattern" &&
                'ProfessorEmail must include a domain with only letters, numbers, and non-consecutive dots between them, e.g., "freddy.fazbear.87@ucsb.edu".'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateRequested">
              Date Requested (iso format)
            </Form.Label>
            <Form.Control
              data-testid="RecommendationRequestForm-dateRequested"
              id="dateRequested"
              type="datetime-local"
              isInvalid={Boolean(errors.dateRequested)}
              {...register("dateRequested", {
                required: true,
                pattern: isodate_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateRequested && "DateRequested is required."}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateNeeded">
              Date Needed (iso format)
            </Form.Label>
            <Form.Control
              data-testid="RecommendationRequestForm-dateNeeded"
              id="dateNeeded"
              type="datetime-local"
              isInvalid={Boolean(errors.dateNeeded)}
              {...register("dateNeeded", {
                required: true,
                pattern: isodate_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateNeeded && "DateNeeded is required."}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="explanation">Explanation</Form.Label>
            <Form.Control
              data-testid={"RecommendationRequestForm-explanation"}
              id="explanation"
              type="text"
              isInvalid={Boolean(errors.explanation)}
              {...register("explanation", {
                required: true,
                maxLength: {
                  value: 100,
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.explanation?.type == "required" &&
                "Explanation is required."}
              {errors.explanation?.type == "maxLength" &&
                "Max Explanation length is 100 characters."}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="done">Done (true or false)</Form.Label>
            <Form.Control
              data-testid={"RecommendationRequestForm-done"}
              id="done"
              type="text"
              isInvalid={Boolean(errors.done)}
              {...register("done", {
                required: true,
                pattern: boolean_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.done?.type === "required" && "Done is required."}
              {errors.done?.type === "pattern" &&
                'Done must be either "true" or "false" in all lowercase.'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="RecommendationRequestForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="RecommendationRequestForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default RecommendationRequestForm;
