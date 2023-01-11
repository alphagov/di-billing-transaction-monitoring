import { Athena } from "aws-sdk";

export class QueryExecutionValidator {
  INTERVAL_MS = 1000;
  MAX_ATTEMPTS = 10;

  athena: Athena;

  constructor(athena: Athena) {
    this.athena = athena;
  }

  /** Try to confirm that query with given ID was successful, and throw error if that fails */
  async validate(id: string): Promise<void> {
    let attempts = 0;

    while (attempts < this.MAX_ATTEMPTS) {
      const { QueryExecution: queryExecution } = await this.athena
        .getQueryExecution({ QueryExecutionId: id })
        .promise();

      attempts += 1;

      const queryExecutionState = queryExecution?.Status?.State;

      if (queryExecutionState === "SUCCEEDED") return;

      if (queryExecutionState === undefined)
        throw new Error("Failed to get query execution state.");

      if (queryExecutionState === "FAILED") {
        const baseErrorMessage = "Query execution failed";

        const athenaErrorMessage =
          JSON.stringify(queryExecution?.Status);

        const errorMessage =
          athenaErrorMessage === undefined
            ? `${baseErrorMessage}.`
            : `${baseErrorMessage}: ${athenaErrorMessage}`;

        throw new Error(errorMessage);
      }

      if (queryExecutionState === "CANCELLED")
        throw new Error("Query execution cancelled.");

      if (!["QUEUED", "RUNNING"].includes(queryExecutionState))
        throw new Error(
          `Unrecognised query execution state: ${queryExecutionState}`
        );

      await new Promise((resolve) => setTimeout(resolve, this.INTERVAL_MS));
    }

    throw new Error(
      `Failed to get successful query execution after ${this.MAX_ATTEMPTS} attempts.`
    );
  }
}
